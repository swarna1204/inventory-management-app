import { useState } from 'react';
import axios from 'axios';
import 'tailwindcss';

const SearchBar = ({ onResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/items/search?name=${searchTerm}`);
      onResult([res.data]);
      setError('');
    } catch {
      setError('Item not found');
      onResult([]);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <label htmlFor="search" className="sr-only">
        Search item by name
      </label>
      <input
        id="search"
        type="text"
        className="flex-1 p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
        placeholder="Search item by name"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        aria-label="Search item by name"
      />
      <button
        onClick={handleSearch}
        className="bg-[#328E6E] hover:bg-[#67AE6E] text-white px-4 py-2 rounded"
      >
        Search
      </button>
      {error && <p className="text-red-500 ml-2">{error}</p>}
    </div>
  );
};

export default SearchBar;
