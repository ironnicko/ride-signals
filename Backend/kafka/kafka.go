package kafka

import (
    "context"
    "log"

    "github.com/segmentio/kafka-go"
)

var Writer *kafka.Writer

func InitProducer(brokers string) {
    Writer = kafka.NewWriter(kafka.WriterConfig{
        Brokers:  []string{brokers},
        Topic:    "ride-signals",
        Balancer: &kafka.LeastBytes{},
    })
    log.Println("Kafka producer initialized")
}

func PublishSignal(key string, value []byte) error {
    return Writer.WriteMessages(context.Background(),
        kafka.Message{
            Key:   []byte(key),
            Value: value,
        },
    )
}
