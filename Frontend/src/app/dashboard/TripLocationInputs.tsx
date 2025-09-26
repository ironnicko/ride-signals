import { GeoLocation } from "@/lib/graphql/schema";
import { Autocomplete } from "@react-google-maps/api"
import { Dispatch, RefObject, SetStateAction, useRef } from "react";


interface TripLocationInputsProps{
    setFormIndex : Dispatch<SetStateAction<number>>,
    setFromLocation: Dispatch<SetStateAction<GeoLocation | null>>,
    setToLocation: Dispatch<SetStateAction<GeoLocation | null>>,
    fromLocation: any,
    toLocation: any
}

export const TripLocationInputs = ({ setFormIndex, setFromLocation, setToLocation, fromLocation, toLocation } : TripLocationInputsProps) =>{  
    const autocompleteFromRef = useRef<google.maps.places.Autocomplete | null>(null);
    const autocompleteToRef = useRef<google.maps.places.Autocomplete | null>(null);
    const onLoadAutocomplete = (
        autocompleteRef: RefObject<google.maps.places.Autocomplete | null>,
        autocomplete: google.maps.places.Autocomplete
    ) => {
        autocompleteRef.current = autocomplete;
    };

    /** 
     * Separate handler for "From" field 
     */
    const handleFromPlaceChanged = () => {
        if (autocompleteFromRef.current) {
        const place = autocompleteFromRef.current.getPlace();
        if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setFromLocation({ lat, lng });
        }
        }
    };

    /** 
     * Separate handler for "To" field 
     */
    const handleToPlaceChanged = () => {
        if (autocompleteToRef.current) {
        const place = autocompleteToRef.current.getPlace();
        if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setToLocation({ lat, lng });
        }
        }
    };


    return (
          <>
          <div className="mb-4 text-center">
                <h2 className="text-lg font-semibold">Plan Your Trip</h2>
                <p className="text-sm text-gray-500">Select your Start and Destination</p>
              </div>

              <div className="flex flex-col gap-3">
                {/* From Location Input */}
                <Autocomplete
                  onLoad={(autocomplete) => onLoadAutocomplete(autocompleteFromRef, autocomplete)}
                  onPlaceChanged={handleFromPlaceChanged}
                >
                  <input
                    type="text"
                    placeholder="Start..."
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </Autocomplete>

                {/* To Location Input */}
                <Autocomplete
                  onLoad={(autocomplete) => onLoadAutocomplete(autocompleteToRef, autocomplete)}
                  onPlaceChanged={handleToPlaceChanged}
                >
                  <input
                    type="text"
                    required
                    placeholder="Destination..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </Autocomplete>
              </div>

              <button disabled={!(fromLocation && toLocation)} onClick={() => setFormIndex(1)} className={`mt-6 w-full px-6 py-3 rounded-lg 
                ${fromLocation && toLocation 
                    ? "bg-black text-white hover:bg-gray-800 cursor-pointer" 
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                Next
              </button>
          </>
        )}