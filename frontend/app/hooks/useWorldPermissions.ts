import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/UserStore";
import { getMyPermissions } from "@/services/worldRole/getMyPermissions.service";
import { connectUserEventsChannel } from "@/services/userEvents/userEventsChannel";

export function useWorldPermissions(worldId: number | undefined) {
  const { permissionsByWorld, setWorldPermissions } = useUserStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!worldId) return;

    let cancelled = false;

    const fetch = () => {
      setLoading(true);
      getMyPermissions(worldId)
        .then((perms) => {
          if (!cancelled) setWorldPermissions(worldId, perms);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    // Subscribe before fetching so no event is missed between fetch and listener attach.
    const channel = connectUserEventsChannel();
    const unsub = channel.subscribe("permissions.updated", (ev) => {
      if (ev.world_id === worldId) fetch();
    });

    fetch();

    return () => {
      cancelled = true;
      unsub();
    };
    // Only update when the world changes, so ignore other dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldId]);

  const permissions = worldId ? (permissionsByWorld[worldId] ?? null) : null;

  return {
    has: (perm: string) => permissions?.includes(perm) ?? false,
    loading,
  };
}
