import React, { useState } from "react";
import { Home, PlusCircle } from "lucide-react";
import { Button } from "./Button";
import { Tabs } from "./Tabs";
import { Dropdown } from "./Dropdown";

interface SidebarProps {
  isLoggedIn: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isLoggedIn }) => {
  const [activeTab, setActiveTab] = useState<"worlds" | "messages">("worlds");

  const worldsData = [
    {
      title: "World 1",
      defaultOpen: true,
      items: [{ label: "Cave" }, { label: "Mountain" }, { label: "Kingdom", isActive: true }],
    },
    {
      title: "World 2",
      defaultOpen: false,
      items: [{ label: "Forest" }, { label: "Desert" }],
    },
  ];

  return (
    <aside className="w-85 h-screen bg-background border-2 border-primary rounded-2xl flex flex-col px-8 py-10 overflow-y-auto">
      {/* gorna sekcja - account */}
      {isLoggedIn ? (
        <div className="flex items-center gap-5 mb-12">
          <img
            src="https://i.pravatar.cc/150?img=5"
            alt="User Avatar"
            className="w-14 h-14 rounded-full border border-primary/50 object-cover"
          />
          <div className="font-cinzel tracking-[0.15em] uppercase">
            <div className="text-[10px] text-input-placeholder font-bold mb-1">Account</div>
            <div className="text-sm text-white font-bold">Nick</div>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 mb-12">
          <Button variant="outline" className="flex-1 px-0 py-2.5 text-xs">
            Login
          </Button>
          <Button variant="outline" className="flex-1 px-0 py-2.5 text-xs">
            Register
          </Button>
        </div>
      )}

      {/* home button */}
      <button
        className={`flex items-center gap-5 px-5 py-3.5 rounded-xl font-cinzel text-sm font-bold tracking-[0.15em] uppercase mb-10 transition-all ${
          !isLoggedIn ? "bg-primary text-white" : "text-white hover:bg-primary/10"
        }`}
      >
        <Home className="w-5.5 h-5.5" />
        <span>Home</span>
      </button>

      {/* tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} hasUnreadMessages={isLoggedIn} />

      {/* tabs - kontent (worlds-dropdown/wiadomości) */}
      <div className="flex-1 flex flex-col">
        {activeTab === "worlds" && (
          <>
            {/* Lista światów dla zalogowanych */}
            {isLoggedIn && (
              <div className="flex flex-col gap-2 mb-8">
                {worldsData.map((world, index) => (
                  <Dropdown
                    key={index}
                    title={world.title}
                    items={world.items}
                    defaultOpen={world.defaultOpen}
                  />
                ))}
              </div>
            )}

            {/* Przycisk dodawania światów */}
            <button
              className={`flex items-center gap-5 text-white font-cinzel text-sm font-bold tracking-[0.15em] uppercase hover:text-primary transition-colors ${!isLoggedIn ? "mt-4" : ""}`}
            >
              <PlusCircle className="w-5.5 h-5.5" />
              <span>Create World</span>
            </button>
          </>
        )}

        {activeTab === "messages" && (
          <div className="text-input-placeholder font-cinzel text-xs uppercase tracking-widest mt-10 text-center">
            {isLoggedIn ? "No new messages." : "Login to view messages."}
          </div>
        )}
      </div>

      {/* stopkaa */}
      <div className="mt-12 flex flex-col items-center">
        <div className="mb-8 w-40 h-52 bg-linear-to-b from-primary/10 to-transparent border border-primary/20 rounded flex items-center justify-center text-center">
          <span className="text-xs text-primary font-cinzel font-bold tracking-widest">
            LOGO
            <br />
            PLACEHOLDER
          </span>
        </div>

        <div className="flex gap-6 text-[10px] text-input-placeholder font-cinzel tracking-[0.15em] uppercase mb-5">
          <a
            href="#"
            className="hover:text-white transition-colors underline underline-offset-[5px] decoration-gray-600 hover:decoration-primary"
          >
            Terms of service
          </a>
          <a
            href="#"
            className="hover:text-white transition-colors underline underline-offset-[5px] decoration-gray-600 hover:decoration-primary"
          >
            Help
          </a>
        </div>

        <div className="text-[10px] text-input-placeholder font-cinzel tracking-[0.15em] uppercase text-center">
          ©2026 Forum Chronicles
        </div>
      </div>
    </aside>
  );
};
