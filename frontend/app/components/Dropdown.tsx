import React, { useState } from "react";
import { Globe, ChevronDown, ChevronUp } from "lucide-react";

export interface DropdownItem {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  title: string;
  items: DropdownItem[];
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  variant?: "sidebar" | "form";
}

export const Dropdown: React.FC<DropdownProps> = ({
  title,
  items,
  defaultOpen = false,
  icon = <Globe className="w-5.5 h-5.5" />,
  variant = "sidebar",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Dynamiczne style przycisku (w formularzu wymuszamy równe 52px wysokości, co centruje tekst)
  const buttonStyles =
    variant === "sidebar" ? "py-2 hover:text-primary" : "h-13 hover:text-white/80";

  // Dynamiczne style dla opcji po najechaniu myszką
  const itemStyles =
    variant === "sidebar" ? "text-white hover:text-primary" : "text-white hover:text-white/70"; // Rozwiązuje problem zlewania się z tłem!

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-white text-sm font-bold transition-colors ${buttonStyles}`}
      >
        <div className="flex items-center gap-5">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && items.length > 0 && (
        <div
          className={`flex flex-col gap-5 pb-4 ${
            variant === "sidebar"
              ? "mt-2 ml-2.75 pl-8.5 border-l border-primary/40 py-2"
              : "mt-1 ml-1"
          }`}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
              className={`text-left text-xs font-bold transition-colors ${
                item.isActive
                  ? variant === "sidebar"
                    ? "text-primary"
                    : "text-white font-extrabold"
                  : itemStyles
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
