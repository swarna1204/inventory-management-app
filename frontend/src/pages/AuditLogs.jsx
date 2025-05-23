import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'tailwindcss';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/items/logs');
        const sortedLogs = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(sortedLogs);
      } catch (err) {
        setError('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#E1EEBC] text-gray-900 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow-lg border border-[#90C67C]">
        <h1 className="text-2xl font-bold mb-4 text-[#20604f]">Today's Audit Logs</h1>

        {loading && <p>Loading logs...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p>No audit logs found for today.</p>
        )}

        {!loading && !error && logs.length > 0 && (
          <table className="w-full table-auto border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#67AE6E] text-white">
                <th className="p-3 border border-[#90C67C]">Action</th>
                <th className="p-3 border border-[#90C67C]">Item Name</th>
                <th className="p-3 border border-[#90C67C]">Performed By</th>
                <th className="p-3 border border-[#90C67C]">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-[#f4fdf7]">
                  <td className="p-3 border border-[#90C67C]">{log.action}</td>
                  <td className="p-3 border border-[#90C67C]">{log.itemName}</td>
                  <td className="p-3 border border-[#90C67C]">{log.performedBy}</td>
                  <td className="p-3 border border-[#90C67C]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Link
          to="/"
          className="mt-6 inline-block text-[#20604f] hover:underline font-medium"
          aria-label="Return to main inventory dashboard"
          title="Go back to inventory dashboard"
        >
          ← Return to Inventory Dashboard
        </Link>
      </div>
    </div>
  );
}

export default AuditLogs;
