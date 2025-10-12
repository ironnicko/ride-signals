import { Server, Socket } from "socket.io";
import http from "http";
import type { JoinRidePayload, JwtPayload } from "./types";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

const isValid = async (
  authToken: string,
): Promise<{ ok: boolean; id?: string }> => {
  try {
    const token = authToken.startsWith("Bearer ")
      ? authToken.slice(7)
      : authToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    if (!decoded || !decoded.userId) {
      return { ok: false };
    }
    return { ok: true, id: decoded.userId };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return { ok: false };
  }
};

const dragonflyClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const addParticipant = async (rideCode: string, userId: string) => {
  const key = `ride:${rideCode}`;
  await dragonflyClient.multi().sadd(key, userId).expire(key, 60).exec();
};

const removeParticipant = async (rideCode: string, userId: string) => {
  await dragonflyClient
    .multi()
    .srem(`ride:${rideCode}`, userId)
    .hdel(`ride:${rideCode}:locations`, userId)
    .exec();
};

io.use(async (socket, next) => {
  try {
    const authToken = socket.handshake.auth.token;
    const valid = await isValid(authToken);

    if (valid.ok) {
      const userId = valid.id;
      (socket as any).userId = userId;
      next();
    } else {
      next(new Error("Unauthorized"));
    }
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket: Socket) => {
  const userId = (socket as any).userId;
  console.log(`User connected: ${userId} (${socket.id})`);

  socket.use(async (_, next) => {
    try {
      const socketMapKey = `socket:${socket.id}:user`;
      const userMapKey = `user:${userId}`;
      await dragonflyClient
        .multi()
        .set(socketMapKey, userId)
        .sadd(userMapKey, socket.id)
        .expire(socketMapKey, 60)
        .expire(userMapKey, 60)
        .exec();
      next();
    } catch (err) {
      next(new Error("Failed to write to Cache!"));
    }
  });

  socket.on("joinRide", async ({ rideCode }: JoinRidePayload) => {
    console.log(`${userId} joining ride ${rideCode}`);

    try {
      socket.join(rideCode);
      await addParticipant(rideCode, userId);

      const allLocations = await dragonflyClient.hgetall(
        `ride:${rideCode}:locations`,
      );

      socket.emit("response", {
        eventType: "updateLocations",
        data: { rideCode, locations: allLocations },
      });

      socket
        .to(rideCode)
        .emit("response", { eventType: "userJoined", data: { userId } });
    } catch (err) {
      console.error("Redis error:", err);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  socket.on("leaveRide", async ({ rideCode }: JoinRidePayload) => {
    console.log(`${userId} leaving ride ${rideCode}`);

    try {
      await removeParticipant(rideCode, userId);

      socket.to(rideCode).emit("userLeft", { userId });

      socket.leave(rideCode);
    } catch (err) {
      console.error("Redis error:", err);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  socket.on("sendLocation", async ({ rideCode, location }) => {
    try {
      const key = `ride:${rideCode}`;
      const hashkey = `${key}:locations`;
      await dragonflyClient
        .multi()
        .hset(hashkey, userId, JSON.stringify(location))
        .hexpire(hashkey, 15, "FIELDS", 1, userId)
        .sadd(key, userId)
        .expire(key, 30)
        .exec();

      const allLocations = await dragonflyClient.hgetall(hashkey);

      socket.emit("response", {
        eventType: "updateLocations",
        data: { rideCode, locations: allLocations },
      });
    } catch (err) {
      console.error("Redis error:", err);
      socket.emit("error", { message: "Failed to update location" });
    }
  });

  socket.on("disconnect", async () => {
    console.log(`❌ User disconnected: ${userId} (${socket.id})`);

    try {
      const storedUserId = await dragonflyClient.get(
        `socket:${socket.id}:user`,
      );
      if (storedUserId) {
        await dragonflyClient
          .multi()
          .srem(`user:${storedUserId}`, socket.id)
          .del(`socket:${socket.id}:user`)
          .exec();
      }
    } catch (err) {
      console.error("Error cleaning up on disconnect:", err);
    }
  });
});

server.listen(3001, "0.0.0.0", () => {
  console.log("Socket.IO server running on port 3001");
});
