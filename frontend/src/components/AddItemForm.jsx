import { useState } from 'react';
import axios from 'axios';
import 'tailwindcss';

// ✅ CRITICAL: Hardcoded fallback to ensure API URL is never undefined
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://inventory-management-app-otbf.onrender.com';

const AddItemForm = ({ onItemAdded }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // ✅ Debug logging
    console.log('🔍 Environment check:');
    console.log('- REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
    console.log('- Final API_BASE_URL:', API_BASE_URL);

    // ✅ Validation
    if (!name.trim()) {
      setError('Item name is required');
      setIsSubmitting(false);
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Price must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (!expiryDate) {
      setError('Expiry date is required');
      setIsSubmitting(false);
      return;
    }

    if (!category) {
      setError('Category is required');
      setIsSubmitting(false);
      return;
    }

    // ✅ Prepare data
    const newItem = {
      name: name.trim(),
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      expiryDate: expiryDate,
      category: category.toLowerCase().trim()
    };

    // ✅ Construct full URL
    const fullURL = `${API_BASE_URL}/api/items`;

    try {
      console.log('🔄 Submitting item:', newItem);
      console.log('📡 Full API URL:', fullURL);

      const response = await axios.post(fullURL, newItem, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout
      });
      
      console.log('✅ Item added successfully:', response.data);
      
      // Call parent callback
      if (onItemAdded) {
        onItemAdded(response.data);
      }

      // Reset form
      setName('');
      setQuantity('');
      setPrice('');
      setExpiryDate('');
      setCategory('');

    } catch (err) {
      console.error('❌ Add item error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: fullURL,
        requestData: newItem
      });
      
      // Handle different error types
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        setError(`Validation Error: ${errorData.error || errorData.message || 'Invalid data'}`);
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please check if the backend is running.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection.');
      } else if (!err.response) {
        setError('Network error. Please check if the backend server is running.');
      } else {
        setError(`Failed to add item: ${err.response?.statusText || err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <section aria-labelledby="add-item-heading">
      {/* ✅ Debug info (remove in production) */}
      <div className="mb-2 text-xs text-gray-500">
        API URL: {API_BASE_URL}
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">
            Item Name *
          </label>
          <input
            id="item-name"
            className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Red Apple"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity *
            </label>
            <input
              id="quantity"
              className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              type="number"
              min="1"
              step="1"
              placeholder="e.g., 50"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($) *
            </label>
            <input
              id="price"
              className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
              value={price}
              onChange={e => setPrice(e.target.value)}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g., 2.50"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">
              Expiry Date *
            </label>
            <input
              id="expiry-date"
              className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              min={getTodayDate()}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={isSubmitting}
              required
            >
              <option value="">Select Category</option>
              <option value="fruit">Fruit</option>
              <option value="vegetable">Vegetable</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-3 rounded font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[#20604f] hover:bg-[#67AE6E] text-white'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Item...
            </span>
          ) : (
            '+ Add Item'
          )}
        </button>
      </form>

      <div className="text-xs text-gray-500 mt-2">
        * Required fields. Expiry date must be today or later.
      </div>
    </section>
  );
};

export default AddItemForm;