import { GeoLocation } from "@/stores/types";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getZoomLevel(distanceKm: number) {
  if (distanceKm < 1) return 15;
  if (distanceKm < 5) return 13;
  if (distanceKm < 20) return 11;
  if (distanceKm < 100) return 8;
  if (distanceKm < 500) return 6;
  if (distanceKm < 2000) return 5;
  return 4;
}

export const EmbedMap = ({ start, destination }: { start: GeoLocation; destination: GeoLocation }) => {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const distanceKm = haversineDistance(start.lat, start.lng, destination.lat, destination.lng);
  const zoom = getZoomLevel(distanceKm);

  const url = `https://www.google.com/maps/embed/v1/directions?key=${key}
    &origin=${start.lat},${start.lng}
    &destination=${destination.lat},${destination.lng}
    &zoom=${zoom}`;

  return (
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0 }}
      src={url}
      allowFullScreen={false}
      loading="lazy"
    />
  );
};
