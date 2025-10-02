import { gql } from "@apollo/client";


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


export const UPDATE_RIDE = gql`
  mutation UpdateRide(
    $rideCode: String!
    $maxRiders: Int
    $visibility: String
    $endedAt: String
    $startedAt: String
    $status: String
  ) {
    updateRide(
      rideCode: $rideCode
      maxRiders: $maxRiders
      visibility: $visibility
      startedAt: $startedAt
      endedAt: $endedAt
      status: $status
    ) {
      rideCode
      status
      startedAt
      endedAt
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
      createdBy
    }
  }
`;