import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import 'tailwindcss';

const ItemList = lazy(() => import('./components/ItemList'));
const AddItemForm = lazy(() => import('./components/AddItemForm'));
const SearchBar = lazy(() => import('./components/SearchBar'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogs'));

function InventoryApp() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortKey, setSortKey] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/items`)
      .then(res => setItems(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleAddItem = (newItem) => {
    setItems([...items, newItem]);
    setFilteredItems([]);
    setSuccess('Item added!');
    setError('');
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/items/${id}`);
      setItems(items.filter(item => item._id !== id));
      setSuccess('Item deleted.');
      setError('');
    } catch {
      setError('Failed to delete item.');
    }
  };

  const handleUpdateItem = async (id, price, quantity) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/items/${id}`, {
        price: parseFloat(price),
        quantity: parseInt(quantity)
      });
      setItems(items.map(i => i._id === id ? res.data : i));
      setSuccess('Item updated.');
      setError('');
    } catch {
      setError('Failed to update item.');
    }
  };

  const handleSearchResult = (results) => {
    setFilteredItems(results);
  };

  const displayedItems = (filteredItems.length ? filteredItems : items)
    .filter(item => !categoryFilter || item.category === categoryFilter)
    .sort((a, b) =>
      sortKey === 'expiryDate'
        ? new Date(a.expiryDate) - new Date(b.expiryDate)
        : a[sortKey].toString().localeCompare(b[sortKey].toString())
    );

  const goToAuditLogs = () => {
    navigate('/audit-logs');
  };

  return (
    <main className="min-h-screen bg-[#E1EEBC] text-gray-900 p-4 relative">
      <div className="max-w-5xl mx-auto pb-24">
        <h1 className="text-4xl font-bold text-center mb-6 text-[#20604f]">
          Fruits & Vegetables Inventory
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-600 text-center">{success}</p>}

        <div className="bg-white p-6 rounded shadow mb-6 border border-[#90C67C]">
          <Suspense fallback={<div>Loading Search Bar...</div>}>
            <SearchBar onResult={handleSearchResult} />
          </Suspense>

          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <select onChange={e => setSortKey(e.target.value)} className="border border-[#67AE6E] rounded p-2">
              <option value="name">Sort by Name</option>
              <option value="price">Price</option>
              <option value="quantity">Quantity</option>
              <option value="expiryDate">Expiry Date</option>
            </select>
            <select onChange={e => setCategoryFilter(e.target.value)} className="border border-[#67AE6E] rounded p-2">
              <option value="">Filter category: All</option>
              <option value="fruit">Fruit</option>
              <option value="vegetable">Vegetable</option>
            </select>
          </div>
        </div>

        <section className="bg-white p-6 rounded shadow mb-6 border border-[#90C67C]">
          <h2 className="text-xl font-semibold mb-4 text-[#20604f]">Add New Item</h2>
          <Suspense fallback={<div>Loading Add Item Form...</div>}>
            <AddItemForm onItemAdded={handleAddItem} />
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<div>Loading Items...</div>}>
            <ItemList items={displayedItems} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} />
          </Suspense>
        </section>
      </div>

      <button
        onClick={goToAuditLogs}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#20604f] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#67AE6E] transition"
      >
        Check Audit Logs
      </button>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <Routes>
        <Route path="/" element={<InventoryApp />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Routes>
    </Suspense>
  );
}
