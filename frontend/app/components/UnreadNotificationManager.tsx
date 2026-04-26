import { useEffect } from "react";
import { useUserStore } from "@/stores/UserStore";
import { connectUserEventsChannel } from "@/services/userEvents/userEventsChannel";
import { apiRequest } from "@/api/apiRequest";

interface UnreadResponse {
  dm_thread_ids: number[];
  room_ids: number[];
}

export function UnreadNotificationManager() {
  const { isLoggedIn, setUnreadDM, setUnreadRoom, initializeUnread } = useUserStore();

  // Subscribe to the user events WS channel for real-time unread updates.
  useEffect(() => {
    if (!isLoggedIn) return;

    const channel = connectUserEventsChannel();
    const unsub = channel.subscribe("unread.updated", (e) => {
      if (e.kind === "dm") setUnreadDM(e.id, e.unread);
      else if (e.kind === "room") setUnreadRoom(e.id, e.unread);
    });

    return unsub;
  }, [isLoggedIn, setUnreadDM, setUnreadRoom]);

  // Seed initial unread state from the API on login.
  useEffect(() => {
    if (!isLoggedIn) {
      initializeUnread([], []);
      return;
    }

    let cancelled = false;

    apiRequest<UnreadResponse>("/api/user/unread/", { requiresAuth: true })
      .then((data) => {
        if (!cancelled) {
          initializeUnread(data.dm_thread_ids, data.room_ids);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, initializeUnread]);

  return null;
}
