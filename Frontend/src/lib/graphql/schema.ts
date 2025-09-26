import { gql } from "@apollo/client";

export interface GeoLocation {
    lat: number
    lng: number
}

export const CREATE_RIDE = gql`
  mutation CreateRide(
    $maxRiders: Int!
    $visibility: String!
    $startLat: Float!
    $startLng: Float!
    $destinationLat: Float!
    $destinationLng: Float!
  ) {
    createRide(
      maxRiders: $maxRiders
      visibility: $visibility
      startLat: $startLat
      startLng: $startLng
      destinationLat: $destinationLat
      destinationLng: $destinationLng
    ) {
      id
      rideCode
      status
      settings {
        maxRiders
        visibility
      }
      participants {
        userId
        role
        joinedAt
      }
      start {
        lat
        lng
      }
      destination {
        lat
        lng
      }
      createdAt
    }
  }
`;
