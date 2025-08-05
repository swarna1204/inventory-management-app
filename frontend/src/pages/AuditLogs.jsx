import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'tailwindcss';

// ✅ API Configuration with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://inventory-management-app-otbf.onrender.com';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        console.log('📡 Fetching audit logs from:', `${API_BASE_URL}/api/items`);
        
        // ✅ Since there's no dedicated logs endpoint, we'll create mock audit logs
        // based on the items' createdAt and updatedAt timestamps
        const response = await axios.get(`${API_BASE_URL}/api/items`);
        const items = response.data;
        
        // ✅ Generate audit logs from items data
        const auditLogs = [];
        
        items.forEach(item => {
          // Add creation log
          if (item.createdAt) {
            auditLogs.push({
              id: `create-${item._id}`,
              action: 'CREATE',
              itemName: item.name,
              performedBy: 'System User',
              timestamp: item.createdAt,
              details: `Added ${item.name} (${item.category}) - Qty: ${item.quantity}, Price: $${item.price}`
            });
          }
          
          // Add update log if item was modified
          if (item.updatedAt && item.updatedAt !== item.createdAt) {
            auditLogs.push({
              id: `update-${item._id}`,
              action: 'UPDATE',
              itemName: item.name,
              performedBy: 'System User',
              timestamp: item.updatedAt,
              details: `Updated ${item.name} - Current Qty: ${item.quantity}, Current Price: $${item.price}`
            });
          }
        });
        
        // ✅ Sort logs by timestamp (most recent first)
        const sortedLogs = auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // ✅ Filter for today's logs (optional - comment out to show all logs)
        const today = new Date().toDateString();
        const todaysLogs = sortedLogs.filter(log => 
          new Date(log.timestamp).toDateString() === today
        );
        
        setLogs(sortedLogs); // Use sortedLogs to show all, or todaysLogs for today only
        console.log(`✅ Generated ${sortedLogs.length} audit log entries`);
        
      } catch (err) {
        console.error('❌ Failed to fetch audit logs:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        
        setError(
          err.response?.data?.message || 
          err.response?.statusText || 
          'Failed to load audit logs. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const retryFetch = () => {
    setLoading(true);
    setError('');
    // Re-run the effect
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#E1EEBC] text-gray-900 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow-lg border border-[#90C67C]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#20604f]">Inventory Audit Logs</h1>
          <Link
            to="/"
            className="text-[#20604f] hover:underline font-medium flex items-center"
            aria-label="Return to main inventory dashboard"
            title="Go back to inventory dashboard"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Dashboard
          </Link>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#20604f]"></div>
            <p className="mt-2 text-[#20604f]">Loading audit logs...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-between">
              <div>
                <strong className="font-bold">Error: </strong>
                <span>{error}</span>
              </div>
              <button 
                onClick={retryFetch}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding, updating, or deleting items to see audit logs here.
            </p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {logs.length} audit log entries
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
                    <tr key={log.id} className="hover:bg-[#f4fdf7]">
                      <td className="p-3 border border-[#90C67C]">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                          log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                          log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 border border-[#90C67C] font-medium">{log.itemName}</td>
                      <td className="p-3 border border-[#90C67C] text-xs text-gray-600">{log.details}</td>
                      <td className="p-3 border border-[#90C67C]">{log.performedBy}</td>
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