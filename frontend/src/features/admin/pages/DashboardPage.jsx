import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getDashboardStatsApi, getAdminOrdersApi, updateOrderStatusApi, deleteOrderApi } from "../api/adminApi";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal"; // In case you want the view modal here too!

export default function DashboardPage() {
  // Stats State
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Orders Table State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5); // Default to 5 for dashboard
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Stats (Only runs once on mount)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStatsApi();
        setStatsData(response.data.stats); // Ignore recentOrders from this endpoint now
      } catch (error) {
        toast.error("Failed to load dashboard statistics");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch Paginated Orders (Runs when controls change)
  useEffect(() => {
    fetchOrders();
  }, [page, limit, sort, status]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const params = { page, limit, sort };
      if (status) params.status = status;
      
      const response = await getAdminOrdersApi(params);
      setOrders(response.data.orders || response.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, currentStatus) => {
    if (["Delivered", "Cancelled"].includes(currentStatus) && newStatus !== currentStatus) {
      toast.error(`Cannot change a ${currentStatus.toLowerCase()} order status`);
      return;
    }

    try {
      await updateOrderStatusApi(orderId, newStatus);
      toast.success("Order status updated!");
      fetchOrders(); // Refresh table
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrderApi(id);
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const StatCard = ({ title, value, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <h3 className="text-sm font-medium text-neutral-500 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
      {subtitle && <p className="text-xs text-neutral-400 mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold">Dashboard Overview</h1>

      {/* Top Stats Row */}
      {statsLoading ? (
        <div className="py-10 text-center text-neutral-500 animate-pulse">Loading statistics...</div>
      ) : statsData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`Rs. ${statsData.revenue.toLocaleString()}`} 
            subtitle="From delivered orders" 
          />
          <StatCard 
            title="Total Orders" 
            value={statsData.orders.total} 
            subtitle={`${statsData.orders.pending} pending, ${statsData.orders.processing} processing`} 
          />
          <StatCard 
            title="Total Customers" 
            value={statsData.customers} 
          />
          <StatCard 
            title="Total Products" 
            value={statsData.products} 
          />
        </div>
      ) : (
        <div className="text-red-500">Failed to load statistics.</div>
      )}

      {/* Order Management Area */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold">Recent Orders</h2>
        
        {/* Sorting, Status, & Limit Controls */}
        <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-neutral-200 gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-600">Show:</label>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1 text-sm outline-none">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-600">Status:</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border rounded px-2 py-1 text-sm outline-none">
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-600">Sort by:</label>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="border rounded px-2 py-1 text-sm outline-none">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Highest Amount</option>
                <option value="amount_low">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Order Table */}
        {ordersLoading ? (
          <div className="py-10 text-center text-neutral-500 animate-pulse">Loading orders...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 font-medium text-neutral-500">Order No.</th>
                    <th className="px-6 py-3 font-medium text-neutral-500">Customer</th>
                    <th className="px-6 py-3 font-medium text-neutral-500">Total</th>
                    <th className="px-6 py-3 font-medium text-neutral-500">Date</th>
                    <th className="px-6 py-3 font-medium text-neutral-500">Status & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4">
                          <p>{order.customerInfo.name}</p>
                          <p className="text-xs text-neutral-500">{order.customerInfo.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-900">
                            Rs. {order.pricing?.total?.toLocaleString() ?? 0}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
                            {order.paymentMethod === "BANK_TRANSFER" ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200">
                                Bank (-Rs. 100)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                                COD
                              </span>
                            )}
                            {order.coupon?.code && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                                Coupon: {order.coupon.code}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 flex flex-col gap-2 items-start">
                          <select
                            value={order.status}
                            disabled={order.status === "Delivered" || order.status === "Cancelled"}
                            onChange={(e) => handleStatusChange(order._id, e.target.value, order.status)}
                            className="border border-neutral-300 rounded px-2 py-1 text-sm bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button 
                            onClick={() => handleDelete(order._id)} 
                            className="text-red-600 hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-neutral-500">
                        No orders found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Component */}
            <Pagination page={page} pages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}