import React from "react";

interface TabsProps {
  activeTab: "worlds" | "messages";
  setActiveTab: (tab: "worlds" | "messages") => void;
  hasUnreadMessages?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, hasUnreadMessages }) => {
  return (
    <div className="flex gap-10 border-b border-primary/20 mb-8 font-cinzel font-bold tracking-[0.15em] ">
      <button
        onClick={() => setActiveTab("worlds")}
        className={`pb-2 relative transition-colors ${
          activeTab === "worlds"
            ? "text-white border-b-2 border-primary"
            : "text-input-placeholder hover:text-white"
        }`}
      >
        Worlds
      </button>

      <button
        onClick={() => setActiveTab("messages")}
        className={`pb-2 relative transition-colors flex items-center gap-3 ${
          activeTab === "messages"
            ? "text-white border-b-2 border-primary"
            : "text-input-placeholder hover:text-white"
        }`}
      >
        Messages
        {hasUnreadMessages && <span className="w-2 h-2 rounded-full bg-primary mb-0.5"></span>}
      </button>
    </div>
  );
};
