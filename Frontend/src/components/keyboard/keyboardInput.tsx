"use client";

import { useKeyboardVisible } from "./keyboardHook";

export default function BottomInputBar() {
  const keyboardVisible = useKeyboardVisible();

  return (
    <div
      className={`
        fixed bottom-0 left-0 w-full 
        bg-white shadow-t p-4 
        transition-all duration-300
        pb-[env(safe-area-inset-bottom)]
        ${keyboardVisible ? "mb-40" : ""}
      `}
    >
      <input
        type="text"
        placeholder="Type your destination..."
        className="
          w-full px-4 py-3 border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-black
        "
      />
      <button className="mt-2 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800">
        Start Trip
      </button>
    </div>
  );
}
