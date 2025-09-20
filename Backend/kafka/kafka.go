package kafka

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/segmentio/kafka-go"
)

var Writer *kafka.Writer
var topic = "ride-signals"

func InitProducer(brokers string) error {
	Writer = kafka.NewWriter(kafka.WriterConfig{
		Brokers:  []string{brokers},
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	})

	go func()(error){	
		var lastErr error
		for {

			conn, err := kafka.Dial("tcp", brokers)
			if err != nil {
				lastErr = err
				time.Sleep(2 * time.Second)
				continue
			}

			controller, err := conn.Controller()
			if err != nil {
				conn.Close()
				lastErr = err
				time.Sleep(2 * time.Second)
				continue
			}

			controllerConn, err := kafka.Dial("tcp", controller.Host+":"+strconv.Itoa(controller.Port))
			if err != nil {
				conn.Close()
				lastErr = err
				time.Sleep(2 * time.Second)
				continue
			}

			topicConfig := kafka.TopicConfig{
				Topic:             topic,
				NumPartitions:     1,
				ReplicationFactor: 1,
			}

			err = controllerConn.CreateTopics(topicConfig)
			controllerConn.Close()
			conn.Close()

			if err == nil {
				break
			}

			lastErr = err
			time.Sleep(2 * time.Second)
		}

		if lastErr != nil {
			return fmt.Errorf("failed to create Kafka topic: %w", lastErr)
		}
		return nil
	}()

	return nil
}

func PublishSignal(key string, value []byte) error {
	if Writer == nil {
		return fmt.Errorf("Kafka writer is not initialized")
	}

	return Writer.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(key),
			Value: value,
			Time:  time.Now(),
		},
	)
}
