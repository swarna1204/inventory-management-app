import { useState } from 'react';
import "tailwindcss";

const ItemList = ({ items, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ price: '', quantity: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditValues({ price: item.price.toString(), quantity: item.quantity.toString() });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ price: '', quantity: '' });
  };

  const saveEdit = async () => {
    if (!editValues.price || !editValues.quantity) {
      alert('Please fill in both price and quantity');
      return;
    }

    if (parseFloat(editValues.price) <= 0 || parseInt(editValues.quantity) <= 0) {
      alert('Price and quantity must be greater than 0');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(editingId, editValues.price, editValues.quantity);
      cancelEdit();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (itemId, itemName) => {
    if (deleteConfirm === itemId) {
      // Actually delete
      try {
        await onDelete(itemId);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    } else {
      // Show confirmation
      setDeleteConfirm(itemId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: 'expired', message: `Expired ${Math.abs(daysDiff)} days ago`, color: 'text-red-600 bg-red-50' };
    } else if (daysDiff <= 3) {
      return { status: 'expiring', message: `Expires in ${daysDiff} days`, color: 'text-orange-600 bg-orange-50' };
    } else if (daysDiff <= 7) {
      return { status: 'warning', message: `Expires in ${daysDiff} days`, color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { status: 'fresh', message: `Expires in ${daysDiff} days`, color: 'text-green-600 bg-green-50' };
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded shadow border border-[#90C67C]">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1M8 8h.01M12 8h.01M16 8h.01" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first inventory item above.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#20604f]">
          Inventory Items ({items.length})
        </h2>
        <div className="text-sm text-gray-600">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mr-2">
            Fresh: {items.filter(item => getExpiryStatus(item.expiryDate).status === 'fresh').length}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
            Expiring Soon: {items.filter(item => ['expiring', 'warning'].includes(getExpiryStatus(item.expiryDate).status)).length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const expiryInfo = getExpiryStatus(item.expiryDate);
          
          return (
            <section 
              key={item._id} 
              className="p-4 bg-white rounded shadow border border-[#90C67C] hover:shadow-md transition-shadow" 
              aria-labelledby={`item-${item._id}`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 id={`item-${item._id}`} className="text-lg font-bold text-[#20604f] capitalize">
                  {item.name}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  item.category === 'fruit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {item.category}
                </span>
              </div>

              {editingId === item._id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring-2 focus:ring-[#90C67C]"
                      value={editValues.price}
                      onChange={e => setEditValues({ ...editValues, price: e.target.value })}
                      placeholder="Enter new price"
                      min="0.01"
                      step="0.01"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-[#67AE6E] rounded focus:outline-none focus:ring-2 focus:ring-[#90C67C]"
                      value={editValues.quantity}
                      onChange={e => setEditValues({ ...editValues, quantity: e.target.value })}
                      placeholder="Enter new quantity"
                      min="1"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={saveEdit} 
                      disabled={isUpdating}
                      className={`flex-1 px-3 py-2 rounded font-medium transition ${
                        isUpdating 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-[#20604f] hover:bg-[#67AE6E] text-white'
                      }`}
                    >
                      {isUpdating ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button 
                      onClick={cancelEdit} 
                      disabled={isUpdating}
                      className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-400 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Price:</span>
                      <p className="text-lg font-bold text-[#20604f]">${item.price}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Quantity:</span>
                      <p className="text-lg font-bold text-[#20604f]">{item.quantity}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <span className="font-medium text-gray-600 text-sm">Expiry:</span>
                    <p className="text-sm text-gray-700">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${expiryInfo.color}`}>
                      {expiryInfo.message}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-3">
                    <button 
                      onClick={() => startEdit(item)} 
                      className="flex-1 bg-[#945034] text-white px-3 py-2 rounded hover:bg-[#7a4028] transition text-sm font-medium"
                    >
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id, item.name)} 
                      className={`flex-1 px-3 py-2 rounded transition text-sm font-medium ${
                        deleteConfirm === item._id 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-[#EE204D] text-white hover:bg-red-600'
                      }`}
                    >
                      {deleteConfirm === item._id ? (
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Confirm Delete
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Delete confirmation notice */}
      {deleteConfirm && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
          <p className="text-sm">
            <strong>Click "Confirm Delete" again to permanently delete the item.</strong>
          </p>
          <p className="text-xs mt-1">This confirmation will auto-cancel in 3 seconds.</p>
        </div>
      )}
    </div>
  );
};

export default ItemList;