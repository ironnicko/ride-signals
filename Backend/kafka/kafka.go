package kafka

import (
	"context"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

var Writer *kafka.Writer

func InitProducer(brokers string) error {

	Writer = kafka.NewWriter(kafka.WriterConfig{
		Brokers:  []string{brokers},
		Topic:    "ride-signals",
		Balancer: &kafka.LeastBytes{},
	})

	conn, err := kafka.Dial("tcp", brokers)
	if err != nil {
		return err
	}
	defer conn.Close()

	controller, err := conn.Controller()
	if err != nil {
		return err
	}
	log.Printf("Connected to Kafka broker %s (controller ID %d)\n", brokers, controller.ID)

	if err := ensureTopic(brokers, "ride-signals", 3, 1); err != nil {
		return err
	}

	log.Println("Kafka producer initialized and connection verified")
	return nil
}

func PublishSignal(key string, value []byte) error {
	return Writer.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(key),
			Value: value,
		},
	)
}

func ensureTopic(brokerAddr, topic string, partitions, replicationFactor int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	conn, err := kafka.DialContext(ctx, "tcp", brokerAddr)
	if err != nil {
		return err
	}
	defer conn.Close()

	return conn.CreateTopics(kafka.TopicConfig{
		Topic:             topic,
		NumPartitions:     partitions,
		ReplicationFactor: replicationFactor,
	})
}
