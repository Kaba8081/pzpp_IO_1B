import React, { useState } from "react";
import { Upload, X, Plus, Edit2, FileText, ArrowRight } from "lucide-react";
import { useUserStore } from "../stores/UserStore";
import { Dropdown } from "./Dropdown";

interface WorldModalProps {
  worldId?: number;
  initialData?: {
    name: string;
    description: string;
    profile_picture: string;
  };
}

export const WorldModal: React.FC<WorldModalProps> = ({ worldId, initialData }) => {
  const { currentModal, modal } = useUserStore();
  const isEditing = !!worldId;

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [attributes, setAttributes] = useState([{ id: "1", name: "ATTRIBUTES 2", type: "SELECT" }]);

  if (currentModal !== "world-modal") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={modal.close}
    >
      <div
        className="relative w-full max-w-250 border border-primary transform overflow-hidden rounded-2xl bg-background shadow-2xl transition-all flex flex-col font-cinzel text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row p-10 gap-10">
          {/* LEWA KOLUMNA */}
          <div className="flex-1 flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-wider mb-2">
              {isEditing ? "EDIT WORLD" : "CREATE WORLD"}
            </h2>

            <div className="border border-dashed border-input-placeholder/50 rounded-2xl p-6 flex justify-between items-center bg-[#111616] transition-colors hover:border-primary">
              <div>
                <div className="text-[10px] text-input-placeholder uppercase tracking-widest mb-1 font-sans">
                  WORLD BANNER
                </div>
                <div className="text-sm font-bold tracking-wider">DRAG AND DROP IMAGE</div>
              </div>
              <button className="flex items-center gap-3 border border-primary/50 px-4 py-2 rounded-xl text-xs hover:bg-primary/20 transition-all font-sans">
                UPLOAD <Upload className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#151a1a] rounded-2xl p-4 flex justify-between items-center border border-transparent focus-within:border-primary">
              <div className="flex-1">
                <div className="text-[10px] text-input-placeholder uppercase tracking-widest mb-1 font-sans">
                  WORLD NAME
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter world name..."
                  className="w-full bg-transparent outline-none text-sm font-bold tracking-wider placeholder-input-placeholder/50 font-sans text-white"
                />
              </div>
              <Edit2 className="w-4 h-4 text-white/50" />
            </div>

            <div className="bg-[#151a1a] rounded-2xl p-4 border border-transparent focus-within:border-primary flex flex-col h-40">
              <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] text-input-placeholder uppercase tracking-widest font-sans">
                  DESCRIPTION
                </div>
                <FileText className="w-4 h-4 text-white/50" />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                className="w-full flex-1 bg-transparent outline-none text-xs leading-relaxed font-sans resize-none text-white/80"
              />
            </div>
          </div>

          {/* PRAWA KOLUMNA */}
          <div className="flex-1 flex flex-col gap-6 md:border-l md:border-primary/20 md:pl-10">
            <h2 className="text-2xl font-bold tracking-wider mb-2">REQUIRED ATTRIBUTES</h2>
            <div className="flex flex-col gap-4">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1 bg-[#151a1a] rounded-xl p-4 flex justify-between items-center h-13">
                    <span className="text-xs tracking-widest uppercase font-sans text-white/80">
                      {attr.name}
                    </span>
                    <X className="w-4 h-4 text-white/50 cursor-pointer hover:text-white" />
                  </div>

                  <div className="bg-primary rounded-xl px-4 w-36 z-10">
                    <Dropdown
                      title={attr.type || "SELECT"}
                      icon={null}
                      variant="form"
                      items={[
                        {
                          label: "NUMBER",
                          onClick: () => {
                            const newAttrs = [...attributes];
                            newAttrs[idx].type = "NUMBER";
                            setAttributes(newAttrs);
                          },
                        },
                        {
                          label: "TEXT",
                          onClick: () => {
                            const newAttrs = [...attributes];
                            newAttrs[idx].type = "TEXT";
                            setAttributes(newAttrs);
                          },
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
              <button className="bg-[#151a1a] rounded-xl p-4 flex justify-between items-center hover:border-primary border border-transparent transition-colors mt-2 h-13">
                <span className="text-xs tracking-widest uppercase font-sans text-white/50">
                  ADD NEW ATTRIBUTES
                </span>
                <Plus className="w-5 h-5 text-white/50" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/30 bg-[#060a0a] p-6 flex justify-between items-center">
          <button
            onClick={modal.close}
            className="flex items-center gap-3 border border-white/20 hover:border-white px-5 py-2.5 rounded-xl transition-colors"
          >
            <div className="bg-white text-background rounded-sm p-0.5">
              <X className="w-3 h-3" />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold font-sans">EXIT</span>
          </button>
          <button
            onClick={() => modal.open("channel-modal")}
            className="flex items-center gap-3 border border-primary text-primary hover:bg-primary/10 px-6 py-2.5 rounded-xl transition-colors"
          >
            <span className="text-xs uppercase tracking-widest font-bold font-sans">
              GO TO CHANNELS
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
