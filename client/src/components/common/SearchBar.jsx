import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';

/**
 * Reusable SearchBar with built-in 300ms debouncing (EC-S10).
 * @param {string} placeholder
 * @param {Function} onSearch - Callback fired with debounced search query string
 * @param {string} initialValue
 */
const SearchBar = ({ placeholder = 'Search...', onSearch, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm.trim());
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="card p-3 flex items-center gap-2 w-full">
      <span className="text-lg text-[var(--color-muted)]">🔍</span>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="input-field border-none bg-transparent focus:bg-transparent focus:outline-none p-0"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="text-xs text-[var(--color-muted)] hover:text-white px-2 py-1 rounded bg-white/5"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchBar;
