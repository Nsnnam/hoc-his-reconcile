import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  badgeColor?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  icon,
  options,
  selectedValues,
  onChange,
  placeholder = 'Tất cả',
  badgeColor = 'bg-sky-100 text-sky-800'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;
  const isNoneSelected = selectedValues.length === 0;

  const handleToggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    onChange(options.map(o => o.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displayText = () => {
    if (selectedValues.length === 0) {
      return `${placeholder} (${options.length})`;
    }
    if (selectedValues.length === 1) {
      const match = options.find(o => o.value === selectedValues[0]);
      return match ? match.label : selectedValues[0];
    }
    return `Đã chọn ${selectedValues.length} mục`;
  };

  return (
    <div className="relative inline-block w-full text-xs" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs bg-slate-50 border rounded-lg transition-all font-medium text-left ${
          isOpen
            ? 'border-sky-500 ring-2 ring-sky-500/20 bg-white'
            : selectedValues.length > 0
            ? 'border-sky-400 bg-sky-50/40 text-slate-900 font-semibold'
            : 'border-slate-300 hover:border-slate-400 text-slate-700'
        }`}
      >
        <div className="flex items-center space-x-1.5 truncate mr-2">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className="truncate">{displayText()}</span>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {selectedValues.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-slate-200"
              title="Xóa lựa chọn"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-600' : ''}`} />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-2 animate-fade-in text-xs">
          {/* Header & Search */}
          <div className="space-y-1.5 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between px-1">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                {label}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${badgeColor}`}>
                {selectedValues.length === 0 ? 'Tất cả' : `${selectedValues.length}/${options.length}`}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sky-600 hover:text-sky-800 font-medium hover:underline"
              >
                Chọn tất cả ({options.length})
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 hover:text-rose-600 hover:underline"
              >
                Bỏ chọn ({selectedValues.length})
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-[11px]">
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-sky-50 text-sky-950 font-medium'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleOption(opt.value)}
                        className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer accent-sky-600 shrink-0"
                      />
                      <span className="truncate" title={opt.label}>
                        {opt.label}
                      </span>
                    </div>

                    {opt.count !== undefined && (
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                        {opt.count.toLocaleString()} ca
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {selectedValues.length === 0 ? 'Hiển thị toàn bộ' : `Đã lọc ${selectedValues.length} mục`}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-medium shadow-2xs"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
