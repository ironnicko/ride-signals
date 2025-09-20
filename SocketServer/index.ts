import { Server, Socket } from "socket.io";
import http from "http";
import { Kafka } from "kafkajs";


interface JoinRidePayload {
  rideCode: string;
  fromUser: string
}

interface KafkaRideEvent {
  rideCode: string;
  type: string;
}

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


const kafka = new Kafka({
  clientId: "socket-server",
  brokers: ["localhost:9094"],
});

const consumer = kafka.consumer({ groupId: "ride-signals-consumer" });

async function runKafka() {
  await consumer.connect();
  await consumer.subscribe({ topic: "ride-signals", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event: KafkaRideEvent = JSON.parse(message.value?.toString() || "{}");

        console.log(event)

        if (!event.rideCode || !event.type) {
          console.warn("Invalid Kafka message:", message.value?.toString());
          return;
        }

        console.log(`Kafka -> Ride ${event.rideCode}:`, event.type);

        io.to(event.rideCode).emit("ride-signals", {
          type: event.type,
          source: "kafka",
        });
      } catch (err) {
        console.error("Error parsing Kafka message", err);
      }
    },
  });
}

runKafka().catch(console.error);

server.listen(3001, () => {
  console.log("🚀 Socket.io + Kafka bridge running on port 3001");
});
