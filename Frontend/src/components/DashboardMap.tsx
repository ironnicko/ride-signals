"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function DashboardMap() {
  const [fromLocation, setFromLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [toLocation, setToLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  const [mounted, setMounted] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setMounted(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setFromLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  if (!mounted || !fromLocation) return <p className="p-4">Loading map...</p>;

  // Fit map to markers
  const FitBounds = () => {
    const map = useMap();
    useEffect(() => {
      if (fromLocation && toLocation) {
        const bounds = L.latLngBounds([
          [fromLocation.lat, fromLocation.lng],
          [toLocation.lat, toLocation.lng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (fromLocation) {
        map.setView([fromLocation.lat, fromLocation.lng], 14);
      }
    }, [fromLocation, toLocation, map]);
    return null;
  };

  // Fetch suggestions from Nominatim
  const fetchSuggestions = async (query: string, setSuggestions: Function) => {
    if (!query) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Map Section */}
      <div className="flex w-full h-2/3 px-7 py-5 items-center">
        <MapContainer center={fromLocation} zoom={14} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={fromLocation} />
          {toLocation && <Marker position={toLocation} />}
          <FitBounds />
        </MapContainer>
      </div>

      {/* Trip Inputs Section */}
      <div className="w-full h-1/3 p-6 bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold">Plan Your Trip</h2>
            <p className="text-sm text-gray-500">Enter your trip details below</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* From Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="From..."
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  fetchSuggestions(e.target.value, setFromSuggestions);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {fromSuggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border rounded-md max-h-48 overflow-y-auto z-50">
                  {fromSuggestions.map((sugg, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setFromLocation({ lat: parseFloat(sugg.lat), lng: parseFloat(sugg.lon) });
                        setFromQuery(sugg.display_name);
                        setFromSuggestions([]);
                      }}
                    >
                      {sugg.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* To Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="To..."
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  fetchSuggestions(e.target.value, setToSuggestions);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {toSuggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border rounded-md max-h-48 overflow-y-auto z-50">
                  {toSuggestions.map((sugg, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setToLocation({ lat: parseFloat(sugg.lat), lng: parseFloat(sugg.lon) });
                        setToQuery(sugg.display_name);
                        setToSuggestions([]);
                      }}
                    >
                      {sugg.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button className="cursor-pointer mt-6 w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
