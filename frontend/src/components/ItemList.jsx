import { useState } from 'react';
import "tailwindcss";

const ItemList = ({ items, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ price: '', quantity: '' });

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditValues({ price: item.price, quantity: item.quantity });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = () => {
    onUpdate(editingId, editValues.price, editValues.quantity);
    cancelEdit();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map(item => (
        <section key={item._id} className="p-4 bg-white rounded shadow border border-[#90C67C]" aria-labelledby={`item-${item._id}`}>
          <h3 id={`item-${item._id}`} className="text-lg font-bold text-[#328E6E]">{item.name}</h3>
          {editingId === item._id ? (
            <>
              <label className="block mt-2 text-sm font-medium text-gray-700">
                Price
                <input
                  type="number"
                  className="w-full mt-1 p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring-2 focus:ring-[#90C67C]"
                  value={editValues.price}
                  onChange={e => setEditValues({ ...editValues, price: e.target.value })}
                  placeholder="Add new price"
                />
              </label>
              <label className="block mt-2 text-sm font-medium text-gray-700">
                Quantity
                <input
                  type="number"
                  className="w-full mt-1 p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring-2 focus:ring-[#90C67C]"
                  value={editValues.quantity}
                  onChange={e => setEditValues({ ...editValues, quantity: e.target.value })}
                  placeholder="Add new quantity"
                />
              </label>
              <div className="mt-2 flex gap-2">
                <button onClick={saveEdit} className="bg-[#328E6E] hover:bg-[#67AE6E] text-white px-3 py-1 rounded transition">Save</button>
                <button onClick={cancelEdit} className="bg-gray-300 text-gray-700 px-3 py-1 rounded">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm">Price: ${item.price}</p>
              <p className="text-sm">Quantity: {item.quantity}</p>
              <p className="text-sm">Expiry: {new Date(item.expiryDate).toLocaleDateString()}</p>
              <p className="text-sm mb-2">Category: {item.category}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="bg-[#945034] text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => onDelete(item._id)} className="bg-[#EE204D] text-white px-3 py-1 rounded">Delete</button>
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  );
};

export default ItemList;
