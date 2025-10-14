import { RideState } from "@/stores/types";
import { UpdateRideParams } from "./RideModal";

export default function RideInfoCard({
  ride,
  formState,
  isEditing,
  onChange,
}: {
  ride: RideState;
  formState: Partial<UpdateRideParams>;
  isEditing: boolean;
  onChange: (updater: any) => void;
}) {
  return (
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200">
      <dl className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm text-gray-800">
        <div>
          <dt className="font-medium text-gray-500">Ride Code</dt>
          <dd className="text-black">{ride.rideCode}</dd>
        </div>

        <div>
          <dt className="font-medium text-gray-500">Visibility</dt>
          <dd className="text-black">
            {isEditing ? (
              <select
                className="border rounded-md px-2 py-1 text-sm focus:ring focus:ring-blue-200 focus:outline-none"
                value={formState.visibility}
                onChange={(e) =>
                  onChange((s: any) => ({
                    ...s,
                    visibility: e.target.value,
                  }))
                }
              >
                <option value="public">public</option>
                <option value="private">private</option>
              </select>
            ) : (
              ride.settings.visibility
            )}
          </dd>
        </div>

        <div>
          <dt className="font-medium text-gray-500">Participants</dt>
          <dd className="text-black">
            {ride.participants.length} /{" "}
            {isEditing && !ride.endedAt ? (
              <input
                type="number"
                min={ ride.participants.length}
                className="w-14 border rounded-md px-2 py-1 text-sm focus:ring focus:ring-blue-200 focus:outline-none"
                value={formState.maxRiders}
                onChange={(e) =>
                  onChange((s: any) => ({
                    ...s,
                    maxRiders: +e.target.value,
                  }))
                }
              />
            ) : (
              ride.settings.maxRiders
            )}
          </dd>
        </div>

        {(ride.startedAt || ride.endedAt) && (
          <div className="col-span-3 flex justify-center gap-12">
            {ride.startedAt && (
              <div>
                <dt className="font-medium text-gray-500 text-center">Started At</dt>
                <dd className="text-black text-center">
                  {new Date(ride.startedAt).toLocaleString()}
                </dd>
              </div>
            )}
            {ride.endedAt && (
              <div>
                <dt className="font-medium text-gray-500 text-center">Ended At</dt>
                <dd className="text-black text-center">
                  {new Date(ride.endedAt).toLocaleString()}
                </dd>
              </div>
            )}
          </div>
        )}

      </dl>
    </div>
  );
}
