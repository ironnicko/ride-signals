"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, CheckCircle2, UserPlus } from "lucide-react";
import { Announcement } from "@/stores/types";

interface AnnouncerProps {
  announcements: Announcement[];
  removeAnnouncement: (id: string) => void;
}

export default function Announcer({
  announcements,
  removeAnnouncement,
}: AnnouncerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {announcements.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-3 border border-gray-200 w-72"
          >
            <div>
              {a.type === "success" && (
                <CheckCircle2 className="text-green-600" />
              )}
              {a.type === "join" && <UserPlus className="text-blue-600" />}
              {a.type === "info" && <Info className="text-gray-600" />}
            </div>
            <p className="flex-1 text-sm text-gray-800">{a.message}</p>
            <button
              onClick={() => removeAnnouncement(a.id)}
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
