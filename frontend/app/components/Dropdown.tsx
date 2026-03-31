import React, { useState } from "react";
import { Globe, ChevronDown, ChevronUp } from "lucide-react";

interface DropdownItem {
  label: string;
  isActive?: boolean;
}

interface DropdownProps {
  title: string;
  items: DropdownItem[];
  defaultOpen?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({ title, items, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-white font-cinzel text-sm font-bold tracking-[0.15em] uppercase hover:text-primary transition-colors py-2"
      >
        <div className="flex items-center gap-5">
          <Globe className="w-5.5 h-5.5" />
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && items.length > 0 && (
        <div className="ml-2.75 pl-8.5 mt-2 border-l border-primary/40 flex flex-col gap-5 py-2">
          {items.map((item, idx) => (
            <button
              key={idx}
              className={`text-left font-cinzel text-xs font-bold tracking-[0.15em] uppercase transition-colors ${
                item.isActive ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
