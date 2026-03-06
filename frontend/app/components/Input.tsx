import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => (
  <div>
    <label>{label}</label>
    <input {...props} />
    {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
  </div>
);
