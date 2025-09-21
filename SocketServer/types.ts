export interface JoinRidePayload {
  rideCode: string;
  fromUser: string
}

export interface KafkaRideEvent {
  rideCode: string;
  type: string;
}

