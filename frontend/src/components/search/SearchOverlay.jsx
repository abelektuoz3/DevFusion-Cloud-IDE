// src/components/search/SearchOverlay.jsx
import React, { useState, useEffect, useRef } from "react";
import { searchAPI } from "../../services/api";
import { FiSearch, FiX, FiFile } from "react-icons/fi";
import toast from "react-hot-toast";

const SearchOverlay = ({ onClose, workspaceId, onOpenFile }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSearch = async () => {
    if (!query || query.length < 2) return;

    setIsSearching(true);
    try {
      const response = await searchAPI.search(query, workspaceId);
      setResults(response.data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (file) => {
    onOpenFile(file._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center border-b border-gray-200 dark:border-slate-700 p-3">
          <FiSearch className="text-gray-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files... (2+ characters)"
            className="flex-1 bg-transparent text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
            <FiX size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3">
          {isSearching ?
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
              Searching...
            </div>
          : results.length === 0 && query.length >= 2 ?
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <FiSearch className="mx-auto text-3xl mb-2" />
              <p>No results found for "{query}"</p>
            </div>
          : results.length === 0 ?
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <p>Type at least 2 characters to search</p>
            </div>
          : <div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                {results.length} result{results.length > 1 ? "s" : ""} found
              </div>
              {results.map((result) => (
                <div
                  key={result._id}
                  onClick={() => handleResultClick(result)}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition group">
                  <FiFile className="text-gray-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {result.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {result.path} • {result.matches} match
                      {result.matches > 1 ? "es" : ""}
                    </div>
                    {result.contentPreview && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 font-mono bg-gray-50 dark:bg-slate-900 p-2 rounded">
                        {result.contentPreview}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 opacity-0 group-hover:opacity-100 transition">
                    Open →
                  </span>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
