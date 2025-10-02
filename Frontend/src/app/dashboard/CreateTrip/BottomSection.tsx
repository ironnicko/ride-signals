import { Profile } from "@/components/Profile";
import { JSX } from "react";

interface BottomSectionProps{
    renderFormInput: () => JSX.Element | undefined
}

export default function BottomSection({renderFormInput} : BottomSectionProps){
    return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
    {/* Profile + Menu */}
    <Profile className="relative top-4 flex flex-col items-center"></Profile>

    {/* Ride Form */}
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80">
        {renderFormInput()}
    </div>
    </div>
    );
}