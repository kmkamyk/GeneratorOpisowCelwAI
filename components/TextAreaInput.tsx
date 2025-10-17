import React from 'react';

interface TextAreaInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  icon: React.ReactNode;
  isGlowing?: boolean;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ id, label, placeholder, value, onChange, rows = 8, icon, isGlowing }) => {

  return (
    <div>
      <div className="flex flex-col space-y-3 p-4">
        <label htmlFor={id} className="flex items-center text-lg font-semibold text-slate-300">
          {icon}
          <span className="ml-3">{label}</span>
        </label>
        <div className={`input-wrapper ${isGlowing ? 'glowing-input-active' : ''}`}>
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-4 bg-transparent border-t-0 border-x-0 border-b-2 border-slate-700/50 rounded-none focus:outline-none focus:ring-0 focus:border-b-sky-400 transition-colors duration-300 text-slate-200 resize-y"
          />
        </div>
      </div>
    </div>
  );
};

export default TextAreaInput;