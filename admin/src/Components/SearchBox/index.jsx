import React, { useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";

const SearchBox = ({
  onSearch,             // (q: string) => void  ← parent hará la llamada al server con ?q=
  setPageOrder,         // (n: number) => void  ← legacy support
  initialValue = "",
  placeholder = "Buscar…",
  debounceMs = 300,
  minLength = 2,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const searchInput = useRef(null);
  const timer = useRef(null);

  // Debounce automático
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = searchQuery.trim();
      // dispara cuando vacías (lista completa) o cuando supera minLength
      if (q.length === 0 || q.length >= minLength) {
        onSearch?.(q);
        setPageOrder?.(1);
      }
    }, debounceMs);
    return () => clearTimeout(timer.current);
  }, [searchQuery, debounceMs, minLength, onSearch, setPageOrder]);

  const onChangeInput = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") setPageOrder?.(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(timer.current);
      const q = searchQuery.trim();
      onSearch?.(q);
      setPageOrder?.(1);
    }
    if (e.key === "Escape") {
      setSearchQuery("");
      setTimeout(() => searchInput.current?.focus(), 0);
    }
  };

  const clear = () => {
    setSearchQuery("");
    onSearch?.("");
    setPageOrder?.(1);
    searchInput.current?.focus();
  };

  return (
    <div className={`w-full h-auto bg-[#f1f1f1] relative overflow-hidden ${className}`} role="search">
      <IoSearch className="absolute top-[13px] left-[10px] z-50 pointer-events-none opacity-80" />
      <input
        ref={searchInput}
        type="search"
        inputMode="search"
        aria-label="Buscar"
        className="w-full h-[40px] border border-[rgba(0,0,0,0.1)] bg-[#f1f1f1] p-2 pl-8 focus:outline-none focus:border-[rgba(0,0,0,0.5)] rounded-md text-[13px]"
        placeholder={placeholder}
        value={searchQuery}
        onChange={onChangeInput}
        onKeyDown={handleKeyDown}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-[7px] text-sm px-2 py-1 rounded hover:bg-black/5"
          aria-label="Limpiar búsqueda"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBox;
