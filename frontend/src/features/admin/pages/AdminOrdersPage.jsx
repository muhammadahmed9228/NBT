import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAdminOrdersApi,
  updateOrderStatusApi,
  getAdminCollectionsApi,
  deleteOrderApi,
} from "../api/adminApi";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // NEW: Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("");
  const [totalPages, setTotalPages] = useState(1);
const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // For debouncing the input
  const [dateRange, setDateRange] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusCounts, setStatusCounts] = useState({}); // Stores the fetched counts
  // Added these new states right under your existing filter states:
  const [collection, setCollection] = useState(""); // Stores selected collection ID
  const [collectionsList, setCollectionsList] = useState([]); // Stores fetched collections for the dropdown
  const [collectionCounts, setCollectionCounts] = useState({}); // Stores the fetched counts

// Added a new useEffect to load Collections on mount (so we can display their names):
  useEffect(() => {
    getAdminCollectionsApi({ limit: 100 })
      .then(res => setCollectionsList(res.data.collections || res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page, limit, sort, status, search, collection, dateRange, dateFrom, dateTo]);

 // Updated fetchOrders to pass search and capture counts:
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit, sort };
      if (status) params.status = status;
      if (search) params.search = search; // Pass search
      if (dateRange) params.dateRange = dateRange;
      if (dateRange === "custom") {
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
      }

      const response = await getAdminOrdersApi(params);
      setOrders(response.data.orders || response.data);
      setTotalPages(response.data.pages || 1);
      if (response.data.statusCounts) setStatusCounts(response.data.statusCounts); // Save counts
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const hasActiveFilters = search !== "" || searchInput !== "" || limit !== 10 || sort !== "newest" || status !== "" || collection !== "" || dateRange !== "" || dateFrom !== "" || dateTo !== "";

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setLimit(10);
    setSort("newest");
    setStatus("");
    setCollection("");
    setDateRange("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleStatusChange = async (orderId, newStatus, currentStatus) => {
    if (["Delivered", "Cancelled"].includes(currentStatus) && newStatus !== currentStatus) {
      toast.error(`Cannot change a ${currentStatus.toLowerCase()} order status`);
      return;
    }

    try {
      await updateOrderStatusApi(orderId, newStatus);
      toast.success("Order status updated!");
      fetchOrders(); // Refresh to reflect changes
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  // 2. Add this function inside your component
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This is temporary/permanent.",
      )
    )
      return;
    try {
      await deleteOrderApi(id);
      toast.success("Order deleted successfully");
      fetchOrders(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  if (loading)
    return <div className="py-10 text-center">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold">Manage Orders</h1>

      {/* NEW: Quick Filter Pills with Counts */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {["Total", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((stat) => (
            <button
              key={stat}
              onClick={() => { setStatus(stat === "Total" ? "" : stat); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                (stat === "Total" && status === "") || status === stat
                  ? "bg-neutral-900 text-white shadow-md"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              {stat} <span className="ml-1 opacity-75">({statusCounts[stat] || 0})</span>
            </button>
          ))}
        </div>
      )}
      
      {/* NEW: Search & Sorting Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 rounded-lg shadow-sm border border-neutral-200 gap-4">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex w-full lg:w-auto flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Search Order ID, Name, or Phone..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-l-md focus:outline-none focus:border-neutral-500"
          />
          <button type="submit" className="bg-neutral-900 text-white px-3 py-1.5 rounded-r-md text-sm hover:bg-neutral-800 transition">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-600">Show:</label>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1 text-sm outline-none">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-neutral-600" htmlFor="order-date-filter">Date Filter:</label>
            <select
              id="order-date-filter"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="border rounded px-2 py-1 text-sm outline-none"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom</option>
            </select>
            {dateRange === "custom" && (
              <>
                <input
                  type="date"
                  aria-label="Orders from date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="border rounded px-2 py-1 text-sm outline-none"
                />
                <input
                  type="date"
                  aria-label="Orders to date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="border rounded px-2 py-1 text-sm outline-none"
                />
              </>
            )}
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
          {hasActiveFilters && (
            <button type="button" onClick={handleClearFilters} className="text-sm text-red-600 font-medium hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md transition">
              Clear Filters
            </button>
          )}
        </div>
      </div>

  

      {loading ? (
        <div className="py-10 text-center">Loading orders...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Order No.
                  </th>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Total
                  </th>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Date
                  </th>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium">
                      {order.orderNumber}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="block text-xs text-indigo-600 hover:underline mt-1"
                      >
                        View Details
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p>{order.customerInfo.name}</p>
                      <p className="text-xs text-neutral-500">
                        {order.customerInfo.email}
                      </p>
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
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        disabled={order.status === "Delivered" || order.status === "Cancelled"}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value, order.status)
                        }
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
                        className="text-red-600 hover:underline text-xs text-left mt-1"
                      >
                        Delete Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} pages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-50 p-4 rounded border border-neutral-200">
                <h4 className="font-bold border-b pb-2 mb-3">Customer Info</h4>
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedOrder.customerInfo.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedOrder.customerInfo.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedOrder.customerInfo.phone}
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded border border-neutral-200">
                <h4 className="font-bold border-b pb-2 mb-3">Shipping Info</h4>
                <p>{selectedOrder.shippingInfo.address}</p>
                <p>
                  {selectedOrder.shippingInfo.city}
                  {selectedOrder.shippingInfo.postalCode ? `, ${selectedOrder.shippingInfo.postalCode}` : ""}
                </p>
                {selectedOrder.shippingInfo.notes && (
                  <p className="mt-2 text-neutral-500 italic">
                    Note: {selectedOrder.shippingInfo.notes}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold border-b pb-2 mb-3">Order Items</h4>
             <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 items-start border p-3 rounded bg-white shadow-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-16 object-cover rounded mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {item.color} / Size: <span className={item.size === "CUSTOM" ? "font-bold text-indigo-600" : ""}>{item.size}</span> / SKU: {item.sku}
                      </p>

                      {/* NEW: Custom Measurements Display */}
                      {item.size === "CUSTOM" && item.customMeasurements && (
                        <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded-md inline-block">
                          <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1 border-b border-indigo-200 pb-1">
                            Custom Measurements (inches)
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-indigo-900">
                            {Object.entries(item.customMeasurements).map(([key, val]) => (
                              <span key={key} className="font-medium whitespace-nowrap">
                                {key}: <span className="font-bold">{val}</span>"
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                    </div>
                    <div className="text-right pt-1">
                      <p className="text-xs">Qty: {item.quantity}</p>
                      <p className="font-bold mt-1">
                        Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(() => {
              const isBankTransfer = selectedOrder.paymentMethod === "BANK_TRANSFER";
              const bankDiscount = isBankTransfer ? 100 : 0;
              const couponDiscount = selectedOrder.coupon?.discountAmount != null
                ? selectedOrder.coupon.discountAmount
                : selectedOrder.coupon?.code
                ? Math.max(0, (selectedOrder.pricing?.discount || 0) - bankDiscount)
                : 0;

              return (
                <div className="bg-neutral-900 text-white p-5 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-neutral-800 text-xs">
                    <div>
                      <span className="text-neutral-400 block mb-1">Payment Method & Status</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">
                          {isBankTransfer ? "Bank Transfer" : selectedOrder.paymentMethod || "COD"}
                        </span>
                        {isBankTransfer && (
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                            -Rs. 100 (Bank Discount)
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                          Status: {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Coupon Details</span>
                      {selectedOrder.coupon?.code ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                            Applied: {selectedOrder.coupon.code}
                          </span>
                          <span className="text-neutral-300 text-xs">
                            {selectedOrder.coupon.discountType === "percentage"
                              ? `(${selectedOrder.coupon.discountValue}% off)`
                              : selectedOrder.coupon.discountValue
                              ? `(Rs. ${selectedOrder.coupon.discountValue} off)`
                              : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">No coupon applied</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm max-w-xs ml-auto">
                    <div className="flex justify-between text-neutral-300">
                      <span>Subtotal:</span>
                      <span className="font-medium">Rs. {selectedOrder.pricing?.subtotal?.toLocaleString() ?? 0}</span>
                    </div>

                    {selectedOrder.coupon?.code && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Coupon ({selectedOrder.coupon.code}):</span>
                        <span className="font-medium">-Rs. {couponDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    {isBankTransfer && (
                      <div className="flex justify-between text-blue-300">
                        <span>Bank Transfer Discount:</span>
                        <span className="font-medium">-Rs. 100</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-300">
                      <span>Shipping Fee:</span>
                      <span className="font-medium">Rs. {selectedOrder.pricing?.shippingCost?.toLocaleString() ?? 0}</span>
                    </div>

                    <div className="border-t border-neutral-700 pt-2 mt-2 flex justify-between items-baseline font-bold text-white">
                      <span className="text-base">Resultant Total:</span>
                      <span className="text-xl text-white">Rs. {selectedOrder.pricing?.total?.toLocaleString() ?? 0}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}
