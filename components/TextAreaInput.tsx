import React from 'react';

interface TextAreaInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  icon: React.ReactNode;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ id, label, placeholder, value, onChange, rows = 8, icon }) => {

  return (
    <div>
      <div className="flex flex-col space-y-3 p-4">
        <label htmlFor={id} className="flex items-center text-lg font-semibold text-slate-700">
          {icon}
          <span className="ml-3">{label}</span>
        </label>
        <div className="input-wrapper">
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-300 text-slate-800 resize-y placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
};

export default TextAreaInput;