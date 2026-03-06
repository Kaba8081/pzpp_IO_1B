import React from "react";

interface ToggleProps {
  label: string;
  error?: string | null;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, error, checked, onChange }) => (
  <div>
    <label>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
    {error && <span>{error}</span>}
  </div>
);
