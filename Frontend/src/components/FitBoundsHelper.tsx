import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

interface FitBoundsHandlerProps {
  fromLocation: google.maps.LatLngLiteral | null;
  toLocation: google.maps.LatLngLiteral | null;
}

export const FitBoundsHandler = ({ fromLocation, toLocation }: FitBoundsHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !fromLocation) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(fromLocation);

    if (toLocation) {
      bounds.extend(toLocation);
    }

    map.fitBounds(bounds);
  }, [map, fromLocation, toLocation]);

  return null;
};
