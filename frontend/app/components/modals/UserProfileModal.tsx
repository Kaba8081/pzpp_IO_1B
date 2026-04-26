import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { MessageSquare, X, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getOrCreateDMThread } from "@/services/dm/getOrCreateThread.service";
import type { ProfilePopupData, WorldRole, AuthUserProfile } from "@/types/models";
import { useUserStore } from "@/stores/UserStore";
import { getRoles } from "@/services/worldRole/getRoles.service";
import { getUserRoles, type UserRoleAssignment } from "@/services/worldRole/getUserRoles.service";
import { assignUserRole } from "@/services/worldRole/assignUserRole.service";
import { removeUserRole } from "@/services/worldRole/removeUserRole.service";
import { useWorldPermissions } from "@/hooks/useWorldPermissions";
import { getUserById, updateCurrentUser } from "@/services/userService";

interface UserProfileModalProps {
  profile: ProfilePopupData;
  onClose: () => void;
  worldId?: number;
}

export const UserProfileModal = ({ profile, onClose, worldId }: UserProfileModalProps) => {
  const { user, setUser, modal } = useUserStore();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [dmLoading, setDmLoading] = useState(false);

  const isOwner = user?.id === profile.user_id;

  const [realProfile, setRealProfile] = useState<AuthUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const worldPerms = useWorldPermissions(worldId);
  const canManageMembers = worldPerms.has("manage_members");

  const [allRoles, setAllRoles] = useState<WorldRole[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProfileLoading(true);
    getUserById(profile.user_id)
      .then((p) => {
        if (cancelled) return;
        setRealProfile(p);
        setEditUsername(p.username ?? "");
        setEditDescription(p.description ?? "");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile.user_id]);

  useEffect(() => {
    if (!worldId) return;
    let cancelled = false;
    setRolesLoading(true);
    setRolesError(null);
    Promise.all([getRoles(worldId), getUserRoles(worldId, profile.user_id)])
      .then(([roles, assignments]) => {
        if (cancelled) return;
        setAllRoles(roles);
        setUserRoles(assignments);
      })
      .catch(() => {
        if (!cancelled) setRolesError("Failed to load roles.");
      })
      .finally(() => {
        if (!cancelled) setRolesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [worldId, profile.user_id]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
    modal.close();
  };

  const handleSendDM = async () => {
    setDmLoading(true);
    try {
      const thread = await getOrCreateDMThread(profile.user_id);
      handleClose();
      navigate(`/dm/${thread.id}`);
    } catch (err) {
      console.error("Failed to open DM thread:", err);
    } finally {
      setDmLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!worldId || !selectedRoleId) return;
    try {
      const assignment = await assignUserRole(worldId, profile.user_id, Number(selectedRoleId));
      setUserRoles((prev) => [...prev, assignment]);
      setSelectedRoleId("");
    } catch (err) {
      console.error("Failed to assign role:", err);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    if (!worldId) return;
    try {
      await removeUserRole(worldId, profile.user_id, roleId);
      setUserRoles((prev) => prev.filter((r) => r.role_id !== roleId));
    } catch (err) {
      console.error("Failed to remove role:", err);
    }
  };

  const handleSaveEdit = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await updateCurrentUser({
        username: editUsername,
        description: editDescription,
      });
      setRealProfile(updated);
      if (user) setUser({ ...user, profile: updated });
      setIsEditing(false);
    } catch {
      setEditError("Failed to save changes.");
    } finally {
      setEditLoading(false);
    }
  };

  const assignableRoles = allRoles.filter(
    (r) => !r.is_system && !userRoles.some((ur) => ur.role_id === r.id)
  );

  const displayName = realProfile?.username ?? profile.name;
  const displayDescription = realProfile?.description ?? profile.description;
  const displayAvatar = realProfile?.profile_picture ?? profile.avatar;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm bg-background border-2 border-primary rounded-2xl p-6 shadow-2xl transition-all duration-200 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-input-placeholder hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isOwner && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-11 text-input-placeholder hover:text-white transition-colors"
            aria-label="Edit profile"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center gap-4 text-center">
          {profileLoading ? (
            <div className="w-20 h-20 rounded-full bg-primary/20 animate-pulse" />
          ) : displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/50"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/50 flex items-center justify-center text-primary text-2xl select-none">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}

          {isEditing ? (
            <div className="w-full flex flex-col gap-2 text-left">
              <Input
                label="Username"
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                disabled={editLoading}
              />
              <Input
                label="Description"
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={editLoading}
              />
              {editError && <p className="text-xs text-error text-center">{editError}</p>}
              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditError(null);
                  }}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 text-sm"
                  onClick={handleSaveEdit}
                  disabled={editLoading || !editUsername.trim()}
                >
                  {editLoading ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {profileLoading ? (
                <div className="space-y-2">
                  <div className="h-5 w-28 rounded bg-primary/20 animate-pulse mx-auto" />
                  <div className="h-4 w-36 rounded bg-primary/10 animate-pulse mx-auto" />
                </div>
              ) : (
                <>
                  <h2 className="text-white text-xl font-medium">{displayName}</h2>
                  {displayDescription && (
                    <p className="text-input-placeholder text-sm mt-1 max-w-xs">
                      {displayDescription}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {worldId && !isEditing && (
          <div className="mt-5">
            {rolesLoading ? (
              <div className="h-6 w-32 animate-pulse rounded bg-primary/20 mx-auto" />
            ) : rolesError ? (
              <p className="text-xs text-error text-center">{rolesError}</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 justify-center">
                  {userRoles.length === 0 && (
                    <span className="text-xs text-input-placeholder">No roles assigned</span>
                  )}
                  {userRoles.map((r) => {
                    const isSystem = allRoles.find((ar) => ar.id === r.role_id)?.is_system ?? false;
                    return (
                      <span
                        key={r.role_id}
                        className="flex items-center gap-1 rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 text-xs text-white"
                      >
                        {r.role_name}
                        {canManageMembers && !isSystem && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(r.role_id)}
                            className="text-input-placeholder hover:text-error transition-colors"
                            aria-label={`Remove ${r.role_name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                {canManageMembers && assignableRoles.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    <select
                      value={selectedRoleId}
                      onChange={(e) =>
                        setSelectedRoleId(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="flex-1 rounded-xl border border-primary/50 bg-background text-white text-sm px-3 py-1.5 focus:outline-none focus:border-primary"
                    >
                      <option value="">Select role…</option>
                      {assignableRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 px-3 py-1.5 text-sm"
                      onClick={handleAssignRole}
                      disabled={!selectedRoleId}
                    >
                      <Plus size={14} />
                      Add
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!isOwner && !isEditing && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleSendDM}
              disabled={dmLoading}
            >
              <MessageSquare size={16} />
              {dmLoading ? "Opening..." : "Send Message"}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
