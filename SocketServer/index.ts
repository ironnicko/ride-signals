import { Server, Socket } from "socket.io";
import { createAdapter } from "socket.io-redis";
import http from "http";
import type { JoinRidePayload } from "./types";
import Redis from "ioredis";

// Redis clients for the adapter
// const pubClient = new Redis({
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: Number(process.env.REDIS_PORT) || 6379,
// });
// const subClient = pubClient.duplicate();

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Attach the Redis adapter
// io.adapter(createAdapter({ pubClient, subClient }));

// Socket.IO events
io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRide", async ({ rideCode, fromUser }: JoinRidePayload) => {
    console.log(`${fromUser} attempting to join ride ${rideCode}...`);

    try {
        socket.join(rideCode);
        console.log(`${fromUser} joined ride ${rideCode}`);

        socket.emit("response", {
          eventType: "joinRide",
          data: { rideCode },
        });

        // Broadcast to all participants (across servers)
        socket.to(rideCode).emit("userJoined", { user: fromUser });
    } catch (err) {
      console.error("Redis error:", err);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Socket.io running on port 3001");
});
