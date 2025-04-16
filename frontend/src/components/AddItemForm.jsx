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
    const newItem = { name, quantity, price, expiryDate, category };
    await axios.post('http://localhost:5000/api/items', newItem);
    onItemAdded(newItem);
    setName('');
    setQuantity('');
    setPrice('');
    setExpiryDate('');
    setCategory('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
        placeholder="Item Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
        placeholder="Quantity"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        type="number"
        min="0"
      />
      <input
        className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
        placeholder="Price"
        value={price}
        onChange={e => setPrice(e.target.value)}
        type="number"
        min="0"
      />
      <input
        className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
        type="date"
        value={expiryDate}
        onChange={e => setExpiryDate(e.target.value)}
      />
      <input
        className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring focus:ring-[#90C67C]"
        placeholder="Category"
        value={category}
        onChange={e => setCategory(e.target.value)}
      />
      <button className="bg-[#328E6E] hover:bg-[#67AE6E] text-white px-4 py-2 rounded">
        Add Item
      </button>
    </form>
  );
};

export default AddItemForm;
