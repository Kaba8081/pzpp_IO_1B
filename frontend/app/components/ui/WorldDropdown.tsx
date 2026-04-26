import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, MoreHorizontal, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";

export interface DropdownItem {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

interface DropdownProps {
  title: string;
  items: DropdownItem[];
  defaultOpen?: boolean;
  isActive?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateItem?: () => void;
  onManageRoles?: () => void;
}

export const WorldDropdown: React.FC<DropdownProps> = ({
  title,
  items,
  defaultOpen = false,
  isActive = false,
  onEdit,
  onDelete,
  onCreateItem,
  onManageRoles,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMenuOpen]);

  const hasActions = onEdit || onDelete || onManageRoles;

  return (
    <div className="mb-2">
      <div
        className={`w-full flex items-center gap-2 group rounded-lg transition-colors -mx-1 px-1 ${isActive ? "bg-primary/10" : "hover:bg-primary/5"}`}
      >
        <button
          onClick={() => setIsOpen((v) => !v)}
          className={`flex items-center gap-3 flex-1 transition-colors py-2 min-w-0 ${isActive ? "text-primary" : "text-white hover:text-primary"}`}
        >
          <ChevronRight
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          />
          <span className="truncate">{title}</span>
        </button>

        {hasActions && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((v) => !v);
              }}
              className="p-1.5 text-input-placeholder hover:text-white hover:bg-primary/20 transition-all rounded-md opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-primary/50 rounded-xl overflow-hidden shadow-xl flex flex-col min-w-36 animate-fade-in">
                {onManageRoles && (
                  <button
                    onClick={() => {
                      onManageRoles();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2.5 text-left text-white hover:bg-primary/20 transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    Manage Roles
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2.5 text-left text-white hover:bg-primary/20 transition-colors flex items-center gap-2"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2.5 text-left text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="ml-2 border-l border-primary/40 pl-5 mt-1 pb-2 flex flex-col gap-1 animate-fade-in">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={idx} className="flex items-center group/channel">
                <button
                  onClick={item.onClick}
                  className={`flex-1 text-left py-1.5 transition-colors rounded ${
                    item.isActive ? "text-primary" : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
                {item.onDelete && (
                  <button
                    onClick={item.onDelete}
                    className="opacity-0 group-hover/channel:opacity-100 p-1 text-input-placeholder hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-input-placeholder py-1.5">No channels yet</p>
          )}
          {onCreateItem && (
            <button
              onClick={onCreateItem}
              className="flex items-center gap-2 text-input-placeholder hover:text-primary transition-colors py-1.5 mt-0.5"
            >
              <Plus className="w-3 h-3" />
              Add channel
            </button>
          )}
        </div>
      )}
    </div>
  );
};
