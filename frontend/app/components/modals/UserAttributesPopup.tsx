import { useEffect, useState } from "react";
import { Button } from "../Button";

export interface Attribute {
  key: string;
  name: string;
  current: number;
}

interface UserAttributesPopupProps {
  isOpen: boolean;
  attributesData: Attribute[];
  onSave: (newValues: Record<string, string>) => void;
  onClose: () => void;
}

export const UserAttributesPopup = ({
  isOpen,
  attributesData,
  onSave,
  onClose,
}: UserAttributesPopupProps) => {
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const handleInputChange = (key: string, val: string) => {
    setNewValues((prev) => ({ ...prev, [key]: val }));
  };

  const renderAttributeRow = (attr: Attribute) => {
    return (
      <div
        key={attr.key}
        className="grid grid-cols-[2fr_1fr_1fr] items-center gap-4 text-white tracking-wider py-2"
      >
        <span className="font-medium truncate">{attr.name}</span>
        <span className="text-center">{attr.current}</span>
        <div className="flex justify-center text-center">
          <input
            type="text"
            placeholder="#"
            className="w-20 rounded-xl border-none bg-white/5 p-3 text-center outline-none ring-1 ring-white/20 transition-all focus:ring-2 focus:ring-primary"
            value={newValues[attr.key] || ""}
            onChange={(e) => handleInputChange(attr.key, e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-120 bg-background border-2 border-primary rounded-[2.5rem] p-8 md:p-10 shadow-2xl transition-all duration-200 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid mb-4 gap-4 grid-cols-[2fr_1fr_1fr] text-primary">
          <span className="flex items-center">Attributes</span>
          <span className="text-center">Current Value</span>
          <span className="text-center">New Value</span>
        </div>

        <div className="flex flex-col">
          {attributesData.map((attr) => renderAttributeRow(attr))}
        </div>

        <div className="mt-4 flex justify-end gap-6">
          <Button onClick={onClose} variant="outline">
            Exit
          </Button>

          <Button onClick={() => onSave(newValues)}>Change</Button>
        </div>
      </div>
    </div>
  );
};
