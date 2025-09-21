import { Kafka } from "kafkajs";
import type { KafkaRideEvent } from "./types";
import type { Server } from "socket.io";


const kafka = new Kafka({
  clientId: "socket-server",
  brokers: ["localhost:9094"],
});

const consumer = kafka.consumer({ groupId: "ride-signals-consumer" });

export async function runKafka(io : Server) {
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
