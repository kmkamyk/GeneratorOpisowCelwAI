import React from 'react';

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange }) => {
  const options = [
    { value: 'Domyślny', label: 'Domyślny (AI wybierze)' },
    { value: 'Profesjonalny/Korporacyjny', label: 'Profesjonalny / Korporacyjny' },
    { value: 'Zwięzły i konkretny', label: 'Zwięzły i konkretny' },
    { value: 'Kreatywny/Dynamiczny', label: 'Kreatywny / Dynamiczny' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
       <label htmlFor="style-selector" className="text-md font-semibold text-slate-300 flex-shrink-0">
          Styl generowania:
        </label>
      <select
        id="style-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800/60 border border-slate-700/80 rounded-md px-4 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all duration-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StyleSelector;
