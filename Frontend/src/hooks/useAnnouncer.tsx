import { Announcement } from "@/stores/types";
import { useState, useCallback } from "react";


export default function useAnnouncer() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const addAnnouncement = useCallback((msg: string, type: Announcement["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    const newA = { id, message: msg, type };
    setAnnouncements((prev) => [...prev, newA]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }, 3000);
  }, []);

  const removeAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { announcements, addAnnouncement, removeAnnouncement };
}
