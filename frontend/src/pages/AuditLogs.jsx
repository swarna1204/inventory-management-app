import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'tailwindcss';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📡 Fetching audit logs...');
      
      // ✅ Use your existing logs endpoint
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/logs`);
      
      setLogs(response.data);
      console.log(`✅ Fetched ${response.data.length} audit logs`);
      
    } catch (err) {
      console.error('❌ Failed to fetch audit logs:', err);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to load audit logs';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'ADD_ITEM':
        return 'bg-green-100 text-green-800';
      case 'UPDATE_ITEM':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE_ITEM':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action) => {
    return action.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDetails = (details, action) => {
    if (!details) return 'No details available';
    
    try {
      switch (action) {
        case 'ADD_ITEM':
          const addedData = details.addedData;
          if (addedData) {
            return `Added: ${addedData.category} - Qty: ${addedData.quantity}, Price: $${addedData.price}`;
          }
          return 'Item added';
          
        case 'UPDATE_ITEM':
          const updatedFields = details.updatedFields;
          if (updatedFields && Object.keys(updatedFields).length > 0) {
            const changes = Object.entries(updatedFields)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            return `Updated: ${changes}`;
          }
          return 'Item updated';
          
        case 'DELETE_ITEM':
          const deletedData = details.deletedData;
          if (deletedData) {
            return `Deleted: ${deletedData.category} - Qty: ${deletedData.quantity}, Price: $${deletedData.price}`;
          }
          return 'Item deleted';
          
        default:
          return 'Action performed';
      }
    } catch (error) {
      console.error('Error formatting details:', error);
      return 'Details unavailable';
    }
  };

  return (
    <div className="min-h-screen bg-[#E1EEBC] text-gray-900 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow-lg border border-[#90C67C]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#20604f]">Today's Audit Logs</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchLogs}
              disabled={loading}
              className="bg-[#20604f] text-white px-4 py-2 rounded hover:bg-[#67AE6E] transition text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link
              to="/"
              className="text-[#20604f] hover:underline font-medium flex items-center"
              aria-label="Return to main inventory dashboard"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Dashboard
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#20604f]"></div>
            <p className="mt-2 text-[#20604f]">Loading audit logs...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-between">
              <div>
                <strong className="font-bold">Failed to load audit logs: </strong>
                <span>{error}</span>
              </div>
              <button 
                onClick={fetchLogs}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && logs.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found for today</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding, updating, or deleting items to see audit logs here.
            </p>
          </div>
        )}

        {/* Logs Table */}
        {!loading && !error && logs.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {logs.length} audit log entries for today
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#67AE6E] text-white">
                    <th className="p-3 border border-[#90C67C]">Action</th>
                    <th className="p-3 border border-[#90C67C]">Item Name</th>
                    <th className="p-3 border border-[#90C67C]">Details</th>
                    <th className="p-3 border border-[#90C67C]">Performed By</th>
                    <th className="p-3 border border-[#90C67C]">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id || `${log.itemId}-${log.timestamp}`} className="hover:bg-[#f4fdf7]">
                      <td className="p-3 border border-[#90C67C]">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="p-3 border border-[#90C67C] font-medium capitalize">
                        {log.itemName || 'Unknown Item'}
                      </td>
                      <td className="p-3 border border-[#90C67C] text-xs text-gray-600">
                        {formatDetails(log.details, log.action)}
                      </td>
                      <td className="p-3 border border-[#90C67C] capitalize">
                        {log.performedBy || 'System'}
                      </td>
                      <td className="p-3 border border-[#90C67C] text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;