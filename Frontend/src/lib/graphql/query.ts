import { gql } from "@apollo/client";

export const MY_RIDES = gql`
    query{
        myRides{
            rideCode
            status
            startedAt
            endedAt
            createdAt
            settings{
                maxRiders
                visibility
            }
            start{
                lat
                lng
            }
            destination{
                lat
                lng
            }
            startName
            destinationName
            participants{
                userId
                role
                joinedAt
            }
        }
    }
`;

export const RIDE = gql`
    query Ride($rideCode: String!) {
    ride(rideCode: $rideCode) {
        rideCode
        status
        startedAt
        endedAt
        createdAt
        settings{
            maxRiders
            visibility
        }
        start{
            lat
            lng
        }
        destination{
            lat
            lng
        }
        startName
        destinationName
        participants{
            userId
            role
            joinedAt
        }
    }
}

`