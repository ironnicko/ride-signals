'use client'; // needed for interactive buttons

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LandingPage() {

  const router = useRouter()
   return ( 
   <div className="flex-1 flex flex-col items-center justify-center">
        <div className="hero flex flex-col gap-5">
          <h1 className="text-5xl font-extrabold text-gray-900">
            Welcome to RideSignals
          </h1>
          <p className="flex text-lg text-gray-600 items-center max-w-xl">
            Plan your trips effortlessly. Create a trip, invite friends, and explore new destinations.
          </p>
        </div>

        <Button
          className="cursor-pointer mt-4 bg-primary text-primary-foreground hover:text-secondary-foreground"
          onClick={() => router.push("/dashboard")}
        >
          Start a Trip!
        </Button>
    </div>
    )

}
