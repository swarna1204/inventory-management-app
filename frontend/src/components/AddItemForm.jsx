import { useState } from 'react';
import axios from 'axios';
import 'tailwindcss';

const AddItemForm = ({ onItemAdded }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newItem = {
      name: name.trim(),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      expiryDate,
      category: category.trim().toLowerCase()
    };

    try {
      const response = await axios.post('${process.env.REACT_APP_API_URL}/api/items', newItem);
      onItemAdded(response.data);

      // Reset form fields
      setName('');
      setQuantity('');
      setPrice('');
      setExpiryDate('');
      setCategory('');
    } catch (err) {
      if (err.response) {
        console.error('Server responded with:', err.response.data);
      } else {
        console.error('Error submitting item:', err.message);
      }
    }
  };

  return (
    <section aria-labelledby="add-item-heading">
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">
            Item Name
          </label>
          <input
            id="item-name"
            className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            id="quantity"
            className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            type="number"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            id="price"
            className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
            value={price}
            onChange={e => setPrice(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            id="expiry-date"
            className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="fruit">Fruit</option>
            <option value="vegetable">Vegetable</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-[#20604f] hover:bg-[#67AE6E] text-white px-4 py-2 rounded"
        >
          Add Item
        </button>
      </form>
    </section>
  );
};

export default AddItemForm;
