/* eslint-disable react/prop-types */
"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, XCircle } from "lucide-react"; // Tambahkan ikon Search dan XCircle

const SearchableCharacterDropdown = ({
  options,
  selectedOption,
  onChange,
  placeholder,
  disabled,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Efek untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectOption = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm(""); // Kosongkan search term setelah memilih
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) setSearchTerm(""); // Kosongkan search term saat membuka
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div
      className="relative w-full md:w-auto md:min-w-[250px]"
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`btn btn-primary ${
          disabled ? "btn-disabled" : "btn-outline"
        } justify-between w-full normal-case`}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="truncate">
          {selectedOption || placeholder || "Pilih Opsi"}
        </span>
        <ChevronDown
          className={`w-5 h-5 ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg max-h-72 flex flex-col">
          <div className="p-2 border-b border-base-300 sticky top-0 bg-base-100 z-10">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-base-content/70" />
              </span>
              <input
                type="text"
                placeholder="Cari karakter..."
                className="input input-sm input-bordered w-full pl-10 pr-8" // Tambah pr-8 untuk ruang XCircle
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label="Clear search"
                >
                  <XCircle className="w-4 h-4 text-base-content/70 hover:text-error" />
                </button>
              )}
            </div>
          </div>
          <ul className="menu p-2 flex-grow overflow-y-auto custom-scrollbar">
            {" "}
            {/* DaisyUI menu untuk styling list */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li key={option}>
                  <a
                    onClick={() => handleSelectOption(option)}
                    // Gunakan kelas active dari DaisyUI jika tema mendukungnya, atau style manual
                    className={`text-base-content space-x-2 ${
                      selectedOption === option
                        ? "bg-primary text-white font-semibold"
                        : "hover:bg-base-200"
                    }`}
                  >
                    {option}
                  </a>
                </li>
              ))
            ) : (
              <li className="menu-title px-4 py-2">
                <span>Karakter tidak ditemukan</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableCharacterDropdown;
