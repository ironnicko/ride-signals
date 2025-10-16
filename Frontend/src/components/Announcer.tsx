"use client";
import { X, Info, CheckCircle2, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Announcement } from "@/stores/types";

interface AnnouncerProps {
  announcements: Announcement[];
  removeAnnouncement: (id: string) => void;
}

export default function Announcer({
  announcements,
  removeAnnouncement,
}: AnnouncerProps) {
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  // Highlight new announcements briefly
  useEffect(() => {
    if (announcements.length === 0) return;
    const newest = announcements[announcements.length - 1];
    setHighlightedIds((prev) => [...prev, newest.id]);
    const timer = setTimeout(() => {
      setHighlightedIds((prev) => prev.filter((id) => id !== newest.id));
    }, 1000);
    return () => clearTimeout(timer);
  }, [announcements]);

  return (
    <AnimatePresence>
      {announcements.length > 0 && (
        <motion.div
          key="announcer"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-[9999] w-80"
        >
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Activity Log</h2>

          <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
            <AnimatePresence>
              {announcements.map((a) => {
                const isHighlighted = highlightedIds.includes(a.id);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-start gap-3 rounded-lg p-3 border border-gray-100 shadow-md backdrop-blur-md
                      ${isHighlighted ? "bg-white/10" : "bg-white/5"} transition-colors duration-700`}
                  >
                    <div className="pt-0.5">
                      {a.type === "success" && (
                        <CheckCircle2 className="text-green-500" size={18} />
                      )}
                      {a.type === "join" && (
                        <UserPlus className="text-blue-500" size={18} />
                      )}
                      {a.type === "info" && (
                        <Info className="text-gray-500" size={18} />
                      )}
                    </div>

                    <p className="flex-1 text-sm text-gray-900">{a.message}</p>

                    <button
                      onClick={() => removeAnnouncement(a.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
