import { useState } from "react";

import {
  X,
  Upload,
  Pencil,
  FileText,
  Plus,
  Delete,
  ChevronDown,
  ArrowRight,
  ChevronUp,
} from "lucide-react";

interface Attribute {
  id: string;
  name: string;
  type: "TEXT" | "NUMBER";
}

export const WorldEditorModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { attributes: Attribute[] }) => void;
}) => {
  const [attributes, setAttributes] = useState<Attribute[]>([
    { id: "1", name: "ATTRIBUTES 2", type: "TEXT" },
    { id: "2", name: "ATTRIBUTES 2", type: "NUMBER" },
  ]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newAttrType, setNewAttrType] = useState<"TEXT" | "NUMBER">("TEXT");

  if (!isOpen) return null;

  const handleAttributeNameChange = (id: string, newName: string) => {
    setAttributes((prev) =>
      prev.map((attr) => (attr.id === id ? { ...attr, name: newName } : attr))
    );
  };

  const removeAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-[#050B0B] border border-primary rounded-xl overflow-hidden ">
        <div className="flex flex-col md:flex-row min-h-125">
          <div className="flex-1 p-8 border-r border-background">
            <h2 className="text-2xl font-serif text-white uppercase tracking-widest mb-8">
              Create World
            </h2>

            <div className="space-y-6">
              <div className="relative group">
                <div className="border-2 border-dashed border-input-placeholder rounded-lg p-4 flex flex-col bg-bg-bg-bg-input-bg hover:border-primary transition-colors cursor-pointer">
                  <span className="text-[10px] text-white uppercase top-4 left-4">
                    Channel Banner
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium uppercase tracking-tighter">
                      Drag and Drop Image
                    </span>
                    <div className="flex items-center gap-2 mb-4 text-white">
                      <span className="text-[10px] font-bold ">UPLOAD</span>
                      <Upload size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-bg-bg-bg-input-bg rounded-lg p-4 flex justify-between items-center border border-input-placeholder hover:border-primary transition-colors cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-[10px] text-input-placeholder uppercase">Channel Name</span>
                  <input
                    type="text"
                    defaultValue="CAVE"
                    className="bg-transparent text-white font-serif uppercase outline-none pt-1"
                  />
                </div>
                <Pencil size={18} className="text-white/60" />
              </div>

              <div className="bg-bg-bg-bg-input-bg rounded-lg p-4 border border-input-placeholder min-h-40 relative  hover:border-primary transition-colors cursor-pointer">
                <span className="text-[10px] text-input-placeholder uppercase block mb-2">
                  Description
                </span>
                <textarea
                  className="bg-transparent text-white text-xs leading-relaxed w-full h-full outline-none  uppercase"
                  defaultValue="Place"
                />
                <FileText size={18} className="absolute top-4 right-4 text-white/60" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 bg-background-secondary">
            <h2 className="text-2xl font-serif text-white uppercase tracking-widest mb-8">
              Required Attributes
            </h2>

            <div className="space-y-4">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex gap-2 group">
                  <div className="flex-1 bg-input-bg rounded-lg p-4 flex justify-between items-center border border-input-placeholder  focus-within:border-primary transition-colors">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => handleAttributeNameChange(attr.id, e.target.value)}
                      className="bg-transparent text-[11px] font-bold uppercase outline-none flex-1 text-white focus:text-white"
                      placeholder="ENTER ATTRIBUTE NAME"
                    />
                    <X
                      size={18}
                      className="text-input-placeholder cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => removeAttribute(attr.id)}
                    />
                  </div>

                  <div className="w-24 bg-input-bg rounded-lg flex items-center justify-center border border-input-placeholder  text-[10px] text-white uppercase font-bold">
                    {attr.type}
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <div className="flex-1 bg-input-bg text-white rounded-lg p-4 flex justify-between items-center border border-input-placeholder  group">
                  <input type="text" placeholder="ADD NEW ATTRIBUTES" className="text-[11px]" />
                  <Plus size={18} className="text-white cursor-pointer hover:text-primary" />
                </div>

                <div className="relative w-24">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full h-full flex items-center justify-between px-3 border border-primary text-[10px] uppercase font-bold transition-colors ${isDropdownOpen ? " rounded-tl-lg rounded-tr-lg text-white bg-primary" : "rounded-lg bg-input-bg     text-white"}`}
                  >
                    {newAttrType}{" "}
                    {isDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full w-full text-primary border border-primary bg-background-secondary rounded-br-lg rounded-bl-lg overflow-hidden z-20 shadow-xl">
                      <div
                        onClick={() => {
                          setNewAttrType("NUMBER");
                          setIsDropdownOpen(false);
                        }}
                        className="p-2 text-[10px] text-white hover:text-primary cursor-pointer uppercase font-bold"
                      >
                        Number
                      </div>
                      <div
                        onClick={() => {
                          setNewAttrType("TEXT");
                          setIsDropdownOpen(false);
                        }}
                        className="p-2 text-[10px] text-white hover:text-primary cursor-pointer uppercase font-bold"
                      >
                        Text
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-primary flex justify-between items-center bg-background">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-error transition-colors border border-error px-6 py-2 rounded-lg"
          >
            <Delete size={16} />

            <span className="text-sm font-serif uppercase tracking-widest">Exit</span>
          </button>

          <button
            onClick={() => onSave({})}
            className="flex items-center gap-4 text-white  hover:bg-primary transition-all border border-primary/40 px-8 py-2 rounded-lg group"
          >
            <span className="text-sm font-serif uppercase">Go to Channel</span>
            <ArrowRight size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
