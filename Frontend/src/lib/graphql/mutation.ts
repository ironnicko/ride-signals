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
    $startName: String!
    $destinationName: String!
  ) {
    createRide(
      maxRiders: $maxRiders
      visibility: $visibility
      startLat: $startLat
      startLng: $startLng
      destinationLat: $destinationLat
      destinationLng: $destinationLng
      startName: $startName
      destinationName: $destinationName
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
      startName
      destination {
        lat
        lng
      }
      destinationName
      createdAt
    }
  }
`;
