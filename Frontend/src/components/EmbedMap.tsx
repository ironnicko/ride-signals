import { GeoLocation } from "@/stores/types";


export const EmbedMap = ({ start, destination }: { start: GeoLocation, destination: GeoLocation }) => {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const url = `https://www.google.com/maps/embed/v1/directions?key=${key}
    &origin=${start.lat},${start.lng}
    &destination=${destination.lat},${destination.lng}
    &zoom=4`;

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
