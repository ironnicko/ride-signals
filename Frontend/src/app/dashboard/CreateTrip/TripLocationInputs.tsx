import { PlaceAutocomplete } from "@/components/PlaceAutoComplete";
import { GeoLocation } from "@/stores/types";
import { Dispatch, SetStateAction } from "react";

interface TripLocationInputsProps {
  setFormIndex: Dispatch<SetStateAction<number>>;
  setFromLocation: Dispatch<SetStateAction<GeoLocation | null>>;
  setToLocationName: Dispatch<SetStateAction<string | null>>
  setFromLocationName: Dispatch<SetStateAction<string | null>>
  setToLocation: Dispatch<SetStateAction<GeoLocation | null>>;
  fromLocation: GeoLocation | null;
  fromLocationName: string | null;
  toLocation: GeoLocation | null;
  toLocationName: string | null;
}

export const TripLocationInputs = ({
  setFormIndex,
  setFromLocation,
  setToLocation,
  setFromLocationName,
  setToLocationName,
  fromLocation,
  fromLocationName,
  toLocation,
  toLocationName
}: TripLocationInputsProps) => {

  const handleFromPlaceChanged = (place: google.maps.places.PlaceResult | null) => {
    if (place?.geometry?.location) {
      setFromLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setFromLocationName(place.name!.toString());
    }
  };

  const handleToPlaceChanged = (place: google.maps.places.PlaceResult | null) => {
    if (place?.geometry?.location) {
      setToLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setToLocationName(place.name!.toString());
    }
  };


  return (
    <>
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">Plan Your Trip</h2>
        <p className="text-sm text-gray-500">Select your Start and Destination</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* From Location Input */}
        <PlaceAutocomplete
          onPlaceSelect={handleFromPlaceChanged}
          defaultValue={fromLocationName}
          placeholder="Start..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* To Location Input */}
        <PlaceAutocomplete
          onPlaceSelect={handleToPlaceChanged}
          defaultValue={toLocationName}
          placeholder="Destination..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        disabled={!(fromLocation && toLocation)}
        onClick={() => setFormIndex(1)}
        className={`mt-6 w-full px-6 py-3 rounded-lg 
          ${fromLocation && toLocation
            ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
            : "bg-gray-300 text-gray-500"
          }`}
      >
        Next
      </button>
    </>
  );
};
