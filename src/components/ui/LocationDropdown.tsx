'use client';

import { useState, useRef, useEffect } from 'react';

const philippineLocations = [
  // Special Options
  { value: 'Remote', label: 'Remote', region: 'Work Setup' },
  { value: 'Hybrid', label: 'Hybrid', region: 'Work Setup' },

  // NCR - Metro Manila
  { value: 'Metro Manila', label: 'Metro Manila (All)', region: 'NCR' },
  { value: 'BGC, Taguig', label: 'BGC, Taguig', region: 'NCR' },
  { value: 'Makati City', label: 'Makati City', region: 'NCR' },
  { value: 'Ortigas, Pasig', label: 'Ortigas, Pasig', region: 'NCR' },
  { value: 'Quezon City', label: 'Quezon City', region: 'NCR' },
  { value: 'Mandaluyong', label: 'Mandaluyong', region: 'NCR' },
  { value: 'Pasay City', label: 'Pasay City', region: 'NCR' },
  { value: 'Parañaque', label: 'Parañaque', region: 'NCR' },
  { value: 'Muntinlupa', label: 'Muntinlupa', region: 'NCR' },
  { value: 'Las Piñas', label: 'Las Piñas', region: 'NCR' },
  { value: 'San Juan', label: 'San Juan', region: 'NCR' },
  { value: 'Marikina', label: 'Marikina', region: 'NCR' },
  { value: 'Caloocan', label: 'Caloocan', region: 'NCR' },
  { value: 'Valenzuela', label: 'Valenzuela', region: 'NCR' },
  { value: 'Navotas', label: 'Navotas', region: 'NCR' },
  { value: 'Malabon', label: 'Malabon', region: 'NCR' },
  { value: 'Manila City', label: 'Manila City', region: 'NCR' },

  // Region III - Central Luzon
  { value: 'Pampanga', label: 'Pampanga', region: 'Central Luzon' },
  { value: 'Clark, Pampanga', label: 'Clark, Pampanga', region: 'Central Luzon' },
  { value: 'Angeles City', label: 'Angeles City', region: 'Central Luzon' },
  { value: 'Bulacan', label: 'Bulacan', region: 'Central Luzon' },
  { value: 'Bataan', label: 'Bataan', region: 'Central Luzon' },
  { value: 'Nueva Ecija', label: 'Nueva Ecija', region: 'Central Luzon' },
  { value: 'Tarlac', label: 'Tarlac', region: 'Central Luzon' },
  { value: 'Zambales', label: 'Zambales', region: 'Central Luzon' },

  // Region IV-A - CALABARZON
  { value: 'Cavite', label: 'Cavite', region: 'CALABARZON' },
  { value: 'Bacoor, Cavite', label: 'Bacoor, Cavite', region: 'CALABARZON' },
  { value: 'Imus, Cavite', label: 'Imus, Cavite', region: 'CALABARZON' },
  { value: 'Laguna', label: 'Laguna', region: 'CALABARZON' },
  { value: 'Santa Rosa, Laguna', label: 'Santa Rosa, Laguna', region: 'CALABARZON' },
  { value: 'Calamba, Laguna', label: 'Calamba, Laguna', region: 'CALABARZON' },
  { value: 'Batangas', label: 'Batangas', region: 'CALABARZON' },
  { value: 'Lipa, Batangas', label: 'Lipa, Batangas', region: 'CALABARZON' },
  { value: 'Rizal', label: 'Rizal', region: 'CALABARZON' },
  { value: 'Antipolo, Rizal', label: 'Antipolo, Rizal', region: 'CALABARZON' },
  { value: 'Quezon Province', label: 'Quezon Province', region: 'CALABARZON' },

  // Region VII - Central Visayas
  { value: 'Cebu City', label: 'Cebu City', region: 'Central Visayas' },
  { value: 'Cebu IT Park', label: 'Cebu IT Park', region: 'Central Visayas' },
  { value: 'Mandaue City', label: 'Mandaue City', region: 'Central Visayas' },
  { value: 'Lapu-Lapu City', label: 'Lapu-Lapu City', region: 'Central Visayas' },
  { value: 'Bohol', label: 'Bohol', region: 'Central Visayas' },

  // Region VI - Western Visayas
  { value: 'Iloilo City', label: 'Iloilo City', region: 'Western Visayas' },
  { value: 'Bacolod City', label: 'Bacolod City', region: 'Western Visayas' },

  // Region XI - Davao
  { value: 'Davao City', label: 'Davao City', region: 'Davao Region' },
  { value: 'Davao del Sur', label: 'Davao del Sur', region: 'Davao Region' },

  // Region X - Northern Mindanao
  { value: 'Cagayan de Oro', label: 'Cagayan de Oro', region: 'Northern Mindanao' },

  // Region I - Ilocos
  { value: 'Baguio City', label: 'Baguio City', region: 'CAR' },
  { value: 'La Union', label: 'La Union', region: 'Ilocos' },
  { value: 'Pangasinan', label: 'Pangasinan', region: 'Ilocos' },
  { value: 'Ilocos Norte', label: 'Ilocos Norte', region: 'Ilocos' },
  { value: 'Ilocos Sur', label: 'Ilocos Sur', region: 'Ilocos' },
];

interface LocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'dark';
}

export function LocationDropdown({
  value,
  onChange,
  placeholder = 'Select location',
  className = '',
  variant = 'default'
}: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = philippineLocations.filter(loc =>
    loc.label.toLowerCase().includes(search.toLowerCase()) ||
    loc.region.toLowerCase().includes(search.toLowerCase())
  );

  // Group locations by region
  const groupedLocations = filteredLocations.reduce((acc, loc) => {
    if (!acc[loc.region]) acc[loc.region] = [];
    acc[loc.region].push(loc);
    return acc;
  }, {} as Record<string, typeof philippineLocations>);

  const handleSelect = (locationValue: string) => {
    onChange(locationValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  const baseInputStyles = variant === 'dark'
    ? 'bg-white text-slate-900 placeholder-slate-400 border-0'
    : 'bg-white text-slate-900 placeholder-slate-400 border border-slate-200';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`w-full px-4 py-3.5 rounded-xl cursor-pointer flex items-center gap-3 ${baseInputStyles} focus-within:ring-2 focus-within:ring-primary-500`}
      >
        <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location..."
            className="flex-1 outline-none bg-transparent text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 text-sm ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {value || placeholder}
          </span>
        )}
        {value && !isOpen && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-80 overflow-y-auto">
          {Object.keys(groupedLocations).length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No locations found
            </div>
          ) : (
            Object.entries(groupedLocations).map(([region, locations]) => (
              <div key={region}>
                <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide sticky top-0">
                  {region}
                </div>
                {locations.map((loc) => (
                  <button
                    key={loc.value}
                    onClick={() => handleSelect(loc.value)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center gap-3 ${
                      value === loc.value ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                    }`}
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {loc.label}
                    {value === loc.value && (
                      <svg className="w-4 h-4 ml-auto text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export { philippineLocations };
