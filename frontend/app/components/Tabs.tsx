import React from "react";
import { Button } from "./Button";

export interface TabItem {
  id: string;
  label: string;
  hasBadge?: boolean;
}

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  items: TabItem[];
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, items }) => {
  return (
    <div className="flex justify-around border-b border-primary/20 mb-8 font-cinzel font-bold tracking-[0.15em]">
      {items.map((tab) => (
        <Button
          key={tab.id}
          variant="tab"
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="flex items-center gap-3"
        >
          {tab.label}
          {tab.hasBadge && <span className="w-2 h-2 rounded-full bg-primary mb-0.5"></span>}
        </Button>
      ))}
    </div>
  );
};
