import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Lock, Plus, Trash2, ShieldCheck } from "lucide-react";

import type { World, WorldRole, WorldRolePermission } from "@/types/models";
import { getWorldById } from "@/services/world";
import { getRoles, createRole, updateRole, deleteRole, getPermissions } from "@/services/worldRole";
import { useUserStore } from "@/stores/UserStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
  manage_world: {
    label: "Manage World",
    description: "Edit world name, description, and image.",
  },
  manage_channels: {
    label: "Manage Channels",
    description: "Create, edit, and delete channels.",
  },
  manage_roles: {
    label: "Manage Roles",
    description: "Create, edit, and delete roles. Assign roles to members.",
  },
  manage_messages: {
    label: "Manage Messages",
    description: "Delete any member's messages.",
  },
  manage_members: {
    label: "Manage Members",
    description: "Assign and remove roles from members.",
  },
  send_messages: {
    label: "Send Messages",
    description: "Send messages in channels.",
  },
};

export default function RolePage() {
  const { user } = useUserStore();
  const { worldId } = useParams<{ worldId: string }>();

  const [worldData, setWorldData] = useState<World>();
  const [roles, setRoles] = useState<WorldRole[]>([]);
  const [permissions, setPermissions] = useState<WorldRolePermission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [editName, setEditName] = useState("");
  const [editPermIds, setEditPermIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [newRoleName, setNewRoleName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  useEffect(() => {
    if (!worldId) return;
    const id = parseInt(worldId);
    setLoading(true);
    Promise.all([getWorldById(id), getRoles(id), getPermissions()])
      .then(([world, fetchedRoles, fetchedPerms]) => {
        setWorldData(world);
        setRoles(fetchedRoles);
        setPermissions(fetchedPerms);
        if (fetchedRoles.length > 0) {
          selectRole(fetchedRoles[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [worldId]);

  function selectRole(role: WorldRole) {
    setSelectedRoleId(role.id);
    setEditName(role.name);
    setEditPermIds(new Set(role.permission_ids));
    setSaveError(null);
  }

  function togglePermission(permId: number, checked: boolean) {
    setEditPermIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permId);
      else next.delete(permId);
      return next;
    });
  }

  async function handleSave() {
    if (!selectedRole || !worldId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateRole(parseInt(worldId), selectedRole.id, {
        name: editName,
        permission_ids: Array.from(editPermIds),
      });
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRoleId(updated.id);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreate() {
    if (!worldId || !newRoleName.trim()) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const created = await createRole(parseInt(worldId), { name: newRoleName.trim() });
      setRoles((prev) => [...prev, created]);
      setNewRoleName("");
      selectRole(created);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create role.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(role: WorldRole) {
    if (!worldId) return;
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await deleteRole(parseInt(worldId), role.id);
      const remaining = roles.filter((r) => r.id !== role.id);
      setRoles(remaining);
      if (selectedRoleId === role.id) {
        if (remaining.length > 0) selectRole(remaining[0]);
        else setSelectedRoleId(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!worldId) return <div className="p-8 text-white/50">Invalid world ID.</div>;
  if (loading) return <div className="p-8 text-white/50">Loading…</div>;
  if (!worldData) return <div className="p-8 text-white/50">World not found.</div>;
  if (worldData.owner_id !== user?.id)
    return (
      <div className="p-8 text-white/50">You do not have permission to manage this world.</div>
    );

  const isDirty =
    selectedRole &&
    (editName !== selectedRole.name ||
      editPermIds.size !== selectedRole.permission_ids.length ||
      Array.from(editPermIds).some((id) => !selectedRole.permission_ids.includes(id)));

  return (
    <div className="flex-1 flex flex-col min-w-0 border border-primary rounded-2xl bg-background m-2 sm:m-4 lg:ml-0 lg:mr-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-primary/30 shrink-0">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold">{worldData.name}</h1>
          <p className="text-xs text-white/40">Role Management</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — role list */}
        <div className="w-56 shrink-0 border-r border-primary/30 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {roles.map((role) => (
              <div
                key={role.id}
                role="button"
                tabIndex={0}
                onClick={() => selectRole(role)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") selectRole(role);
                }}
                className={`group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                  selectedRoleId === role.id
                    ? "bg-primary/20 text-primary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate min-w-0">
                  {role.is_system && <Lock className="h-3 w-3 shrink-0 text-white/30" />}
                  <span className="truncate">{role.name}</span>
                </span>
                {!role.is_system && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(role);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-error transition-all shrink-0"
                    aria-label={`Delete ${role.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {roles.length === 0 && <p className="px-3 py-2 text-xs text-white/30">No roles yet.</p>}
          </div>

          {/* Create role */}
          <div className="p-3 border-t border-primary/30 space-y-2">
            <Input
              placeholder="New role name"
              value={newRoleName}
              onChange={(e) => {
                setNewRoleName(e.target.value);
                setCreateError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              error={createError}
              fieldClassName="rounded-lg"
            />
            <Button
              variant="outline"
              className="w-full px-3 py-2 text-sm flex items-center justify-center gap-2"
              onClick={handleCreate}
              disabled={isCreating || !newRoleName.trim()}
            >
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Right panel — role editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedRole ? (
            <div className="max-w-xl space-y-6">
              <Input
                label="Role Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <div>
                <h2 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-widest">
                  Permissions
                </h2>
                <div className="space-y-2">
                  {permissions.map((perm) => {
                    const meta = PERMISSION_LABELS[perm.name];
                    return (
                      <div
                        key={perm.id}
                        className="flex items-start justify-between gap-4 rounded-xl border border-primary/20 bg-background-site/50 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">
                            {meta?.label ?? perm.name}
                          </p>
                          {meta?.description && (
                            <p className="text-xs text-white/40 mt-0.5">{meta.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={editPermIds.has(perm.id)}
                          onClick={() => togglePermission(perm.id, !editPermIds.has(perm.id))}
                          className={`relative shrink-0 w-12 h-6 rounded-full border transition-all duration-200 ${
                            editPermIds.has(perm.id)
                              ? "bg-primary border-primary"
                              : "bg-input-bg border-input-border"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                              editPermIds.has(perm.id) ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {saveError && <p className="text-xs text-error">{saveError}</p>}

              <Button onClick={handleSave} disabled={isSaving || !isDirty} className="w-full">
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
              Select or create a role to edit it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
