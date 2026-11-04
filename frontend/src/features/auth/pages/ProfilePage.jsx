// import { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { toast } from "react-toastify";
// import { updateProfileApi, changePasswordApi } from "../api/authApi";
// import { setCredentials } from "../authSlice";

// export default function ProfilePage() {
//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   const [profileData, setProfileData] = useState({ name: user?.name || "", phone: user?.phone || "" });
//   const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });

//   const handleProfileSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await updateProfileApi(profileData);
//       dispatch(setCredentials(response.data));
//       toast.success("Profile updated successfully!");
//     } catch (error) {
//       toast.error(error.message || "Failed to update profile");
//     }
//   };

//   const handlePasswordSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await changePasswordApi(passwordData);
//       toast.success("Password changed successfully!");
//       setPasswordData({ oldPassword: "", newPassword: "" });
//     } catch (error) {
//       toast.error(error.message || "Failed to change password");
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto py-8 space-y-8">
//       <h2 className="text-3xl font-serif font-bold">My Account</h2>

//       {/* Account Info Card */}
//       <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
//         <h3 className="text-lg font-semibold border-b pb-2">Profile Details</h3>
//         <form onSubmit={handleProfileSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Full Name</label>
//             <input
//               type="text"
//               value={profileData.name}
//               onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
//               className="w-full px-3 py-2 border border-neutral-300 rounded-md"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Phone Number</label>
//             <input
//               type="text"
//               value={profileData.phone}
//               onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
//               className="w-full px-3 py-2 border border-neutral-300 rounded-md"
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-800"
//           >
//             Update Profile
//           </button>
//         </form>
//       </div>

//       {/* Change Password Card */}
//       <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
//         <h3 className="text-lg font-semibold border-b pb-2">Change Password</h3>
//         <form onSubmit={handlePasswordSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Current Password</label>
//             <input
//               type="password"
//               value={passwordData.oldPassword}
//               onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
//               className="w-full px-3 py-2 border border-neutral-300 rounded-md"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">New Password</label>
//             <input
//               type="password"
//               value={passwordData.newPassword}
//               onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
//               className="w-full px-3 py-2 border border-neutral-300 rounded-md"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-800"
//           >
//             Change Password
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateProfileApi, changePasswordApi } from "../api/authApi";
import { getMyOrdersApi } from "../../orders/api/ordersApi";
import { setCredentials } from "../authSlice";
import PasswordInput from "../../../components/PasswordInput";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Tab State
  const [activeTab, setActiveTab] = useState("profile");

  // Profile States
  const [profileData, setProfileData] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await getMyOrdersApi();
      setOrders(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to load order history");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfileApi(profileData);
      dispatch(setCredentials(response.data));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePasswordApi(passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    }
  };

  return (
    <div className="nbt-profile-page max-w-4xl mx-auto py-8">
      <p className="nbt-eyebrow mb-2">Private wardrobe</p>
      <h2 className="nbt-profile-title text-3xl font-serif font-bold mb-6">My Account</h2>

      {/* Tabs */}
      <div className="nbt-profile-tabs flex space-x-6 border-b border-neutral-200 mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "orders"
              ? "border-b-2 border-neutral-900 text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Order History
        </button>
      </div>

      {activeTab === "profile" ? (
        <div className="nbt-profile-cards grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Info Card */}
          <div className="nbt-profile-card bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Profile Details</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-800"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="nbt-profile-card bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <PasswordInput
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <PasswordInput
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-800"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="nbt-order-history space-y-6">
          {loadingOrders ? (
            <div className="text-center py-12 text-neutral-500">Loading order history...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
              <p className="text-neutral-600">You haven't placed any orders yet.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="nbt-order-card bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-neutral-100 pb-4 mb-4 gap-2">
                  <div>
                    <p className="text-sm text-neutral-500">
                      Order <span className="font-semibold text-neutral-900">#{order.orderNumber}</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'}`}
                  >
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex gap-4 items-center">
                      <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded border border-neutral-200" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-neutral-900">{item.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{item.color} | Size: {item.size}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">Rs. {item.unitPrice.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-100">
                  <p className="text-sm text-neutral-500 font-medium">{order.paymentMethod}</p>
                  <p className="font-bold text-lg text-neutral-900">
                    Total: Rs. {order.pricing.total.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
