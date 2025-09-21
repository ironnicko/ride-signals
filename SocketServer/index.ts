import { Server, Socket } from "socket.io";
import http from "http";
import type { JoinRidePayload } from "./types";
import { runKafka } from "./consumer";


const rideParticipants: Record<string, string[]> = {
  ride123: ["user1", "user2"],
  ride456: ["user3", "user4"],
};

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);
  socket.on("joinRide", ({ rideCode, fromUser }: JoinRidePayload) => {
    const participants = rideParticipants[rideCode] || [];
    if (participants.includes(fromUser)) {
      socket.join(rideCode);
      console.log(`${fromUser} joined ride ${rideCode}`);
      socket.emit("ride-joined", { rideCode });
    } else {
      socket.emit("error", { message: "Not authorized for this ride" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


runKafka(io).catch(console.error);

server.listen(3001, () => {
  console.log("🚀 Socket.io + Kafka bridge running on port 3001");
});
