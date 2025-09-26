import { Dispatch, SetStateAction } from "react";

interface TripSettingsInputsProps{
    setMaxRiders: Dispatch<SetStateAction<number>>,
    setVisibility: Dispatch<SetStateAction<"public" | "private">>
    maxRiders: number
    visibility: string
    CreateRide: () => void

}


export const TripSettingsInputs = ({maxRiders, visibility, setMaxRiders, setVisibility, CreateRide}: TripSettingsInputsProps) => {

    return (
      <>
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold">Trip Settings</h2>
          <p className="text-sm text-gray-500">
            Set maximum riders and choose visibility
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Max Riders Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Max Riders</label>
            <input
              type="number"
              min={1}
              max={50}
              value={Math.min(50, maxRiders)}
              onChange={(e) => setMaxRiders(Number(e.target.value))}
              className="w-3/4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter number of riders"
            />
          </div>

          {/* Visibility Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <div className="flex gap-4 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                />
                <span>Public</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                />
                <span>Private</span>
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={CreateRide}
          className="cursor-pointer mt-6 w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Create
        </button>
      </>
    );
  };