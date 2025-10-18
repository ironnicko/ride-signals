"use client";
import { GeoLocation, UserState } from "@/stores/types";
import { useEffect } from "react";

interface FitBoundsHandlerProps {
  fromLocation: GeoLocation | null;
  toLocation: GeoLocation | null;
  otherUsers: Record<string, UserState>;
}

export function FitBoundsHandler({
  fromLocation,
  toLocation,
  otherUsers,
}: FitBoundsHandlerProps) {
  useEffect(() => {
    const fitMapBounds = () => {
      const bounds = new google.maps.LatLngBounds();

      const points: GeoLocation[] = [];

      if (
        fromLocation &&
        isFinite(fromLocation.lat) &&
        isFinite(fromLocation.lng)
      ) {
        points.push(fromLocation);
      }

      if (toLocation && isFinite(toLocation.lat) && isFinite(toLocation.lng)) {
        points.push(toLocation);
      }

      Object.values(otherUsers).forEach((u) => {
        const location = u.location;
        if (location && isFinite(location.lat) && isFinite(location.lng)) {
          points.push(location);
        }
      });

      if (points.length === 0) return;

      points.forEach((point) => {
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
      });

      const mapElement = document.querySelector("canvas"); // or your map ref
      if (!mapElement) return;

      const mapInstance = (window as any).googleMap as google.maps.Map;
      if (!mapInstance) return;

      mapInstance.fitBounds(bounds);
    };

    fitMapBounds();

    // Optional: refit periodically if users move
    // const intervalID = setInterval(fitMapBounds, 5000);
    // return () => clearInterval(intervalID);
  }, [fromLocation, toLocation, otherUsers]);

  return null;
}
