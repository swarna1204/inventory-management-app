import { useState } from 'react';
import axios from 'axios';
import 'tailwindcss';

// ✅ API Configuration with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://inventory-management-app-otbf.onrender.com';

const SearchBar = ({ onResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      console.log('🔍 Searching for:', searchTerm);
      console.log('📡 Search API URL:', `${API_BASE_URL}/api/items`);

      // ✅ Fetch all items and filter on frontend (more reliable)
      const response = await axios.get(`${API_BASE_URL}/api/items`);
      const allItems = response.data;

      // ✅ Filter items based on search term
      const filteredItems = allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log(`✅ Search completed: ${filteredItems.length} items found out of ${allItems.length} total items`);
      
      onResult(filteredItems);
      
      if (filteredItems.length === 0) {
        setError(`No items found matching "${searchTerm}"`);
      }
    } catch (err) {
      console.error('❌ Search error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      setError('Search failed. Please try again.');
      onResult([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setError('');
    onResult([]); // Clear search results
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 w-full">
        <label htmlFor="search" className="sr-only">
          Search item by name
        </label>
        <input
          id="search"
          type="text"
          className="flex-1 p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
          placeholder="Search item by name or category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSearching}
          aria-label="Search item by name or category"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchTerm.trim()}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isSearching || !searchTerm.trim()
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[#20604f] hover:bg-[#67AE6E] text-white'
          }`}
        >
          {isSearching ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </span>
          )}
        </button>
        
        {searchTerm && (
          <button
            onClick={handleClear}
            disabled={isSearching}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:bg-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="text-xs text-gray-500">
        💡 Tip: Search by item name (e.g., "apple") or category ("fruit", "vegetable")
      </div>
    </div>
  );
};

export default SearchBar;