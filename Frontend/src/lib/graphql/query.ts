import { gql } from "@apollo/client";
import { GeoLocation } from "./mutation";

interface Participant { userId: string; role: string; joinedAt: string }
interface Settings { maxRiders: number; visibility: string }

export interface Ride {
    id: string;
    rideCode: string;
    status: string;
    createdAt: string;
    endedAt?: string;
    participants: Participant[];
    settings: Settings;
    start: GeoLocation;
    destination: GeoLocation;
    startName: string;
    destinationName: string;
}

export const MY_RIDES = gql`
    query{
        myRides{
            id
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