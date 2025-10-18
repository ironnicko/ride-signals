import { UserState } from "@/stores/types";
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

interface FitBoundsHandlerProps {
  fromLocation: google.maps.LatLngLiteral | null;
  toLocation: google.maps.LatLngLiteral | null;
  otherUsers: Record<string, UserState> | null;
}

export const FitBoundsHandler = ({
  fromLocation,
  toLocation,
  otherUsers,
}: FitBoundsHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    const fitMapBounds = () => {
      if (!map || !fromLocation || !toLocation) return;

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(fromLocation);

      bounds.extend(toLocation);

      if (otherUsers)
        Object.entries(otherUsers).map(([id, u]) => {
          if (!u.location) return null;
          bounds.extend(u.location);
        });

      map.fitBounds(bounds);
    };
    // const intervalID = setInterval(fitMapBounds, 10 * 1000);
    fitMapBounds();

    // return () => clearInterval(intervalID);
  }, [map, fromLocation, toLocation]);

  return null;
};
