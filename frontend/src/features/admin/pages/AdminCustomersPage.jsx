import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAdminCustomersApi } from "../api/adminApi";
import Modal from "../components/Modal";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getAdminCustomersApi();
        setCustomers(response.data);
      } catch (error) {
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (loading)
    return <div className="py-10 text-center">Loading customers...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold">Registered Customers</h1>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 font-medium text-neutral-500">Name</th>
              <th className="px-6 py-3 font-medium text-neutral-500">Email</th>
              <th className="px-6 py-3 font-medium text-neutral-500">Phone</th>
              <th className="px-6 py-3 font-medium text-neutral-500">
                Joined Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {customers.map((customer) => (
              <tr key={customer._id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 font-medium">{customer.name}</td>
                <td className="px-6 py-4">{customer.email}</td>
                <td className="px-6 py-4">{customer.phone || "N/A"}</td>
                <td className="px-6 py-4 text-neutral-500">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="block text-xs text-blue-600 hover:underline mt-1"
                >
                  View Details
                </button>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Profile"
      >
        {selectedCustomer && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <p className="text-xl font-bold">{selectedCustomer.name}</p>
                <p className="text-neutral-500">
                  Joined:{" "}
                  {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="bg-neutral-50 p-4 rounded border">
              <p className="mb-2">
                <span className="font-bold">Email:</span>{" "}
                {selectedCustomer.email}
              </p>
              <p className="mb-2">
                <span className="font-bold">Phone:</span>{" "}
                {selectedCustomer.phone || "Not provided"}
              </p>
              <p>
                <span className="font-bold">Account Status:</span> Active
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
