import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import 'tailwindcss';

const ItemList = lazy(() => import('./components/ItemList'));
const AddItemForm = lazy(() => import('./components/AddItemForm'));
const SearchBar = lazy(() => import('./components/SearchBar'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogs'));

// ✅ API Configuration with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://inventory-management-app-otbf.onrender.com';

// ✅ Configure axios defaults
axios.defaults.timeout = 30000; // 30 seconds timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

function InventoryApp() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortKey, setSortKey] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('checking');
  const navigate = useNavigate();

  // ✅ NEW: Wake up server function
  const wakeUpServer = async () => {
    try {
      console.log('🔄 Waking up server...');
      setServerStatus('waking');
      
      // Try to wake up the server
      await axios.get(`${API_BASE_URL}/wake`, { timeout: 60000 }); // 1 minute timeout for wake up
      
      console.log('✅ Server is awake');
      setServerStatus('awake');
      return true;
    } catch (err) {
      console.log('⚠️ Server wake-up failed, but continuing...', err.message);
      setServerStatus('unknown');
      return false;
    }
  };

  // ✅ IMPROVED: Fetch items with better error handling
  const fetchItems = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      console.log(`📡 Fetching items... (attempt ${retryCount + 1})`);
      setError('');
      
      // Log the API URL for debugging
      console.log('🔗 API URL:', `${API_BASE_URL}/api/items`);
      
      const response = await axios.get(`${API_BASE_URL}/api/items`);
      console.log('📦 Items fetched successfully:', response.data.length, 'items');
      
      setItems(response.data);
      setServerStatus('connected');
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Fetch error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => fetchItems(retryCount + 1), 2000 * (retryCount + 1)); // Exponential backoff
      } else {
        setError(`Failed to fetch items after ${maxRetries + 1} attempts. Please check if the server is running.`);
        setServerStatus('error');
        setLoading(false);
      }
    }
  };

  // ✅ IMPROVED: Initial load with server wake-up
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing app...');
      setLoading(true);
      
      // First, try to wake up the server (for Render free tier)
      await wakeUpServer();
      
      // Wait a moment for the server to fully start
      setTimeout(() => {
        fetchItems();
      }, 2000);
    };
    
    initializeApp();
  }, []);

  // ✅ Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleAddItem = async (newItem) => {
    try {
      console.log('➕ Adding new item:', newItem);
      const response = await axios.post(`${API_BASE_URL}/api/items`, newItem);
      
      setItems([...items, response.data]);
      setFilteredItems([]);
      setSuccess('Item added successfully!');
      setError('');
      
      console.log('✅ Item added successfully');
    } catch (err) {
      console.error('❌ Add item error:', err);
      setError('Failed to add item. Please try again.');
      setSuccess('');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      console.log('🗑️ Deleting item:', id);
      await axios.delete(`${API_BASE_URL}/api/items/${id}`);
      
      setItems(items.filter(item => item._id !== id));
      setSuccess('Item deleted successfully!');
      setError('');
      
      console.log('✅ Item deleted successfully');
    } catch (err) {
      console.error('❌ Delete item error:', err);
      setError('Failed to delete item. Please try again.');
      setSuccess('');
    }
  };

  const handleUpdateItem = async (id, price, quantity) => {
    try {
      console.log('📝 Updating item:', id, { price, quantity });
      const response = await axios.put(`${API_BASE_URL}/api/items/${id}`, {
        price: parseFloat(price),
        quantity: parseInt(quantity)
      });
      
      setItems(items.map(i => i._id === id ? response.data : i));
      setSuccess('Item updated successfully!');
      setError('');
      
      console.log('✅ Item updated successfully');
    } catch (err) {
      console.error('❌ Update item error:', err);
      setError('Failed to update item. Please try again.');
      setSuccess('');
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

  // ✅ NEW: Server status indicator
  const getStatusColor = () => {
    switch (serverStatus) {
      case 'checking': return 'bg-yellow-500';
      case 'waking': return 'bg-orange-500';
      case 'awake': 
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'checking': return 'Checking server...';
      case 'waking': return 'Waking up server...';
      case 'awake': return 'Server awake';
      case 'connected': return 'Connected';
      case 'error': return 'Connection error';
      default: return 'Unknown status';
    }
  };

  return (
    <main className="min-h-screen bg-[#E1EEBC] text-gray-900 p-4 relative">
      <div className="max-w-5xl mx-auto pb-24">
        {/* ✅ NEW: Server status indicator */}
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-md">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-6 text-[#20604f]">
          Fruits & Vegetables Inventory
        </h1>

        {/* ✅ IMPROVED: Better error and success messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex">
              <div className="flex-1">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
              <button 
                onClick={() => {
                  setError('');
                  fetchItems();
                }}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Success: </strong>
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* ✅ Loading state */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#20604f]"></div>
            <p className="mt-2 text-[#20604f]">Loading inventory...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="bg-white p-6 rounded shadow mb-6 border border-[#90C67C]">
              <Suspense fallback={<div>Loading Search Bar...</div>}>
                <SearchBar onResult={handleSearchResult} />
              </Suspense>

              <div className="mt-4 flex flex-wrap gap-4 items-center">
                <select 
                  onChange={e => setSortKey(e.target.value)} 
                  className="border border-[#67AE6E] rounded p-2"
                  value={sortKey}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Price</option>
                  <option value="quantity">Quantity</option>
                  <option value="expiryDate">Expiry Date</option>
                </select>
                <select 
                  onChange={e => setCategoryFilter(e.target.value)} 
                  className="border border-[#67AE6E] rounded p-2"
                  value={categoryFilter}
                >
                  <option value="">Filter category: All</option>
                  <option value="fruit">Fruit</option>
                  <option value="vegetable">Vegetable</option>
                </select>
                <span className="text-sm text-gray-600">
                  Showing {displayedItems.length} of {items.length} items
                </span>
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
                <ItemList 
                  items={displayedItems} 
                  onDelete={handleDeleteItem} 
                  onUpdate={handleUpdateItem} 
                />
              </Suspense>
            </section>
          </>
        )}
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#E1EEBC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#20604f]"></div>
          <p className="mt-4 text-[#20604f] text-lg">Loading Application...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<InventoryApp />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Routes>
    </Suspense>
  );
}