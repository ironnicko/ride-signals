import { gql } from "@apollo/client";
import { GeoLocation } from "@/stores/types";

export const MY_RIDES = gql`
    query{
        myRides{
            rideCode
            status
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