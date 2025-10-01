"use client";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_RIDE, GeoLocation } from "@/lib/graphql/mutation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TripLocationInputs } from "./TripLocationInputs";
import { TripSettingsInputs } from "./TripSettingsInputs";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/stores/useAuth";
import { FitBoundsHandler } from "@/components/FitBoundsHelper";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const [createRide] = useMutation(CREATE_RIDE);
  const [formIndex, setFormIndex] = useState<number>(0);
  const [toLocation, setToLocation] = useState<GeoLocation | null>(null);
  const [fromLocation, setFromLocation] = useState<GeoLocation | null>(null);
  const [toLocationName, setToLocationName] = useState<string | null>(null);
  const [fromLocationName, setFromLocationName] = useState<string | null>(null);
  const [maxRiders, setMaxRiders] = useState<number>(5);
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [toMarkerRef] = useAdvancedMarkerRef();
  const [fromMarkerRef] = useAdvancedMarkerRef();
  const { user, logout } = useAuth.getState();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFromLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const CreateRide = async () => {
    try {
      await createRide({
        variables: {
          maxRiders,
          visibility,
          startLat: fromLocation!.lat,
          startLng: fromLocation!.lng,
          startName: fromLocationName,
          destinationLat: toLocation!.lat,
          destinationLng: toLocation!.lng,
          destinationName: toLocationName,
        },
      });
      toast.success("Successfully Created Ride!");
      router.push("/dashboard/myRides");
    } catch (err) {
      toast.error("Failed to Create Ride!");
    }
  };

  const contextMenu = () => {
    return (
      <div className="absolute top-14 bg-white shadow-lg rounded-lg border w-40 z-50">
          <ul className="flex flex-col">
            <li
              onClick={() => {
                router.push("/dashboard/myRides");
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              My Rides
            </li>
            {/* <li
              onClick={() => {
                router.push("/dashboard/settings");
                setMenuOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Settings
            </li> */}
            <li
              onClick={logout}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
            >
              Logout
            </li>
          </ul>
        </div>
    );
  }

  const renderFormInput = () => {
    switch (formIndex) {
      case 0:
        return (
          <TripLocationInputs
            setFromLocationName={setFromLocationName}
            setToLocationName={setToLocationName}
            setFormIndex={setFormIndex}
            setFromLocation={setFromLocation}
            setToLocation={setToLocation}
            fromLocation={fromLocation}
            toLocation={toLocation}
            fromLocationName={fromLocationName}
            toLocationName={toLocationName}
          />
        );
      case 1:
        return (
          <TripSettingsInputs
            setMaxRiders={setMaxRiders}
            setVisibility={setVisibility}
            maxRiders={maxRiders}
            visibility={visibility}
            CreateRide={CreateRide}
          />
        );
    }
  };

  if (!fromLocation) return <p className="p-4">Fetching current location...</p>;

  return (
    <ProtectedRoute>
      <div className="relative w-screen h-screen">
          <Map
            defaultCenter={fromLocation}
            disableDefaultUI={true}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
            defaultZoom={12}
            style={{ width: "100%", height: "100%" }}
          >
            {fromLocation && <AdvancedMarker ref={fromMarkerRef} position={fromLocation} />}
            {toLocation && <AdvancedMarker ref={toMarkerRef} position={toLocation} />}
            <FitBoundsHandler fromLocation={fromLocation} toLocation={toLocation} />
          </Map>

          {/* Bottom Section */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">

            {formIndex > 0 ? (<button
                onClick={() => setFormIndex(Math.max(0, formIndex - 1))}
                className="relative top-[10vh] flex items-center rounded-full gap-1 px-4 py-2 bg-white cursor-pointer"
              >
                <ArrowLeft size={18} />
                {/* <span className="text-sm font-medium">Back</span> */}
            </button>) : <></>}

            {/* Profile + Menu */}
            <div className="relative top-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer">
                <Image
                  src={user?.picture ? user.picture : "/user.svg"}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="object-cover"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                />
              </div>

              {/* Dropdown Menu anchored under profile */}
              {menuOpen && contextMenu()}
            </div>

            {/* Ride Form */}
            <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80 mt-4">
              {renderFormInput()}
            </div>
          </div>
      </div>
    </ProtectedRoute>
  );
}
