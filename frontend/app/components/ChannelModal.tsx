import React from "react";
import { Upload, X, Plus, Edit2, FileText, ArrowLeft, Trash2 } from "lucide-react";
import { useUserStore } from "@/stores/UserStore"; // Upewnij się, że ścieżka jest poprawna

export const ChannelModal: React.FC = () => {
  const { currentModal, modal } = useUserStore();

  // Jeśli w sklepie ten modal nie jest aktywny, nie renderuj nic
  if (currentModal !== "channel-modal") return null;

  const mockChannels = [
    {
      id: 1,
      name: "CAVE",
      image:
        "https://images.unsplash.com/photo-1542401886-65d6c61de152?q=80&w=1920&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "MOUNTAIN",
      image:
        "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1920&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "KINGDOM",
      image:
        "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1920&auto=format&fit=crop",
    },
  ];

  return (
    // Własne tło modala (Zastępuje <Modal>)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={modal.close}
    >
      <div
        className="relative w-full max-w-250 border border-primary transform overflow-hidden rounded-2xl bg-background shadow-2xl transition-all flex flex-col font-cinzel text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row p-10 gap-10">
          {/* LEWA KOLUMNA: Lista kanałów */}
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-2xl font-bold tracking-wider mb-2">EDIT CHANNELS</h2>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-100 pr-2 scrollbar-thin scrollbar-thumb-primary">
              {mockChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="relative h-20 rounded-xl overflow-hidden border border-primary/30 cursor-pointer group"
                >
                  <img
                    src={channel.image}
                    alt={channel.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg tracking-widest font-bold drop-shadow-md">
                      {channel.name}
                    </span>
                  </div>
                </div>
              ))}

              <button className="h-20 bg-input-bg rounded-xl flex items-center justify-center gap-3 border border-transparent hover:border-primary/50 transition-colors">
                <span className="text-sm tracking-widest uppercase">ADD NEW CHANNEL</span>
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PRAWA KOLUMNA: Edycja Kanału */}
          <div className="flex-1 flex flex-col gap-6 md:border-l md:border-primary/20 md:pl-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold tracking-wider">CHANNEL</h2>
              <button className="bg-error hover:bg-error/80 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
                <span className="text-[10px] uppercase tracking-widest font-bold font-sans">
                  DELETE CHANNEL
                </span>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="relative h-24 rounded-2xl overflow-hidden border border-dashed border-input-placeholder/50 flex items-center justify-between p-6 cursor-pointer hover:border-primary group">
              <img
                src={mockChannels[0].image}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                alt="bg"
              />
              <div className="relative z-10">
                <div className="text-[10px] text-white/70 uppercase tracking-widest mb-1 font-sans">
                  CHANNEL BANNER
                </div>
                <div className="text-sm font-bold tracking-wider">DRAG AND DROP IMAGE</div>
              </div>
              <button className="relative z-10 flex items-center gap-3 border border-white/30 bg-black/40 px-4 py-2 rounded-xl text-xs font-sans">
                UPLOAD <Upload className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-input-bg rounded-2xl p-4 flex justify-between items-center">
              <div className="flex-1">
                <div className="text-[10px] text-input-placeholder uppercase tracking-widest mb-1 font-sans">
                  CHANNEL NAME
                </div>
                <input
                  type="text"
                  defaultValue="CAVE"
                  className="w-full bg-transparent outline-none text-sm font-bold tracking-wider text-white font-sans"
                />
              </div>
              <Edit2 className="w-4 h-4 text-white/50" />
            </div>

            <div className="bg-input-bg rounded-2xl p-4 flex flex-col h-32">
              <div className="flex justify-between items-start mb-2">
                <div className="text-[10px] text-input-placeholder uppercase tracking-widest font-sans">
                  SHORT DESCRIPTION
                </div>
                <FileText className="w-4 h-4 text-white/50" />
              </div>
              <textarea
                defaultValue="ASDADAFFSA ADSFASF ASADASD ASDSAD AS DASDSA DSAD ASD ASD SAD AS DASD SAKDAS DSADKADS JASKD AKS"
                className="w-full flex-1 bg-transparent outline-none text-xs leading-relaxed font-sans resize-none text-white/80"
              />
            </div>
          </div>
        </div>

        {/* STOPKA */}
        <div className="border-t border-primary/30 bg-background-site p-6 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => modal.close()}
              className="flex items-center gap-3 border border-white/20 hover:border-white px-5 py-2.5 rounded-xl transition-colors"
            >
              <div className="bg-white text-background rounded-sm p-0.5">
                <X className="w-3 h-3" />
              </div>
              <span className="text-xs uppercase tracking-widest font-bold font-sans">EXIT</span>
            </button>

            <button
              // Powrót do edycji świata
              onClick={() => modal.open("world-modal")}
              className="flex items-center gap-3 border border-white/20 hover:border-white px-5 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-bold font-sans">
                BACK TO WORLD
              </span>
            </button>
          </div>

          <button className="flex items-center gap-3 bg-primary text-white hover:bg-primary/80 px-8 py-2.5 rounded-xl transition-colors">
            <span className="text-xs uppercase tracking-widest font-bold font-sans">CREATE</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
