import React, { useState, useRef, useEffect } from 'react';
import { Filter, Search, X, Check } from 'lucide-react';

export interface ColumnFilterItem {
  value: string;
  label: string;
  count: number;
}

interface ColumnFilterPopupProps {
  columnTitle: string;
  items: ColumnFilterItem[];
  selectedValues: string[]; // Rỗng nghĩa là không áp dụng lọc (chọn tất cả)
  onFilterChange: (selected: string[]) => void;
  align?: 'left' | 'right';
}

export const ColumnFilterPopup: React.FC<ColumnFilterPopupProps> = ({
  columnTitle,
  items,
  selectedValues,
  onFilterChange,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Local state trong lúc user đang tick/untick
  const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);
  const popupRef = useRef<HTMLDivElement>(null);

  // Sync tempSelected khi selectedValues bên ngoài thay đổi
  useEffect(() => {
    setTempSelected(selectedValues);
  }, [selectedValues, isOpen]);

  // Đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
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

  const isFiltered = selectedValues.length > 0;

  const filteredItems = items.filter(it =>
    it.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleToggle = (val: string) => {
    if (tempSelected.includes(val)) {
      setTempSelected(tempSelected.filter(v => v !== val));
    } else {
      setTempSelected([...tempSelected, val]);
    }
  };

  const handleSelectAll = () => {
    setTempSelected(items.map(it => it.value));
  };

  const handleClearAll = () => {
    setTempSelected([]);
  };

  const handleApply = () => {
    // Nếu chọn tất cả items hoặc chọn 0 item thì tương đương bỏ lọc
    if (tempSelected.length === items.length || tempSelected.length === 0) {
      onFilterChange([]);
    } else {
      onFilterChange(tempSelected);
    }
    setIsOpen(false);
  };

  const handleResetThisColumn = () => {
    setTempSelected([]);
    onFilterChange([]);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center ml-1 text-slate-700" ref={popupRef}>
      {/* Icon button mở popup filter */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1 rounded transition-colors ${
          isFiltered
            ? 'bg-sky-500 text-white shadow-xs hover:bg-sky-600'
            : 'text-slate-400 hover:text-sky-600 hover:bg-slate-200/80'
        }`}
        title={isFiltered ? `Đang lọc cột ${columnTitle} (${selectedValues.length} giá trị)` : `Lọc cột ${columnTitle}`}
      >
        <Filter className={`w-3 h-3 ${isFiltered ? 'fill-current' : ''}`} />
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-1.5 w-64 sm:w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-2.5 text-xs normal-case tracking-normal font-normal text-slate-800 animate-fade-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={columnTitle}>
                Lọc: {columnTitle}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search box */}
          <div className="pt-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Tìm giá trị..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-6 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Actions: Select all / Clear all */}
          <div className="flex items-center justify-between py-1.5 text-[11px] border-b border-slate-100 text-slate-500">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sky-600 hover:underline font-medium"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-slate-500 hover:text-rose-600 hover:underline"
            >
              Bỏ chọn tất cả
            </button>
            <span className="font-mono text-slate-400">
              {tempSelected.length === 0 ? 'Tất cả' : `${tempSelected.length}/${items.length}`}
            </span>
          </div>

          {/* List of checkbox items */}
          <div className="max-h-52 overflow-y-auto py-1 space-y-0.5 pr-1">
            {filteredItems.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-[11px]">
                Không có giá trị phù hợp
              </div>
            ) : (
              <>
                {filteredItems.slice(0, 100).map((it) => {
                  const isChecked = tempSelected.length === 0 || tempSelected.includes(it.value);
                  return (
                    <label
                      key={it.value}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors ${
                        isChecked ? 'bg-sky-50/70 text-sky-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate mr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (tempSelected.length === 0) {
                              setTempSelected(items.map(i => i.value).filter(v => v !== it.value));
                            } else {
                              handleToggle(it.value);
                            }
                          }}
                          className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer accent-sky-600 shrink-0"
                        />
                        <span className="truncate" title={it.label}>
                          {it.label}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                        {it.count.toLocaleString()}
                      </span>
                    </label>
                  );
                })}
                {filteredItems.length > 100 && (
                  <div className="py-1 text-center text-[10px] text-slate-400 italic">
                    Hiển thị 100 / {filteredItems.length.toLocaleString()} giá trị (tìm kiếm để lọc thêm)
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleResetThisColumn}
              className="text-rose-600 hover:underline font-medium"
            >
              Xóa lọc cột này
            </button>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-medium shadow-2xs"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
