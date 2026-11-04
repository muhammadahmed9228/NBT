import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createCouponApi,
  deleteCouponApi,
  getCouponsApi,
  toggleCouponStatusApi,
  updateCouponApi,
} from "../api/adminApi";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minimumOrderAmount: 0,
  expiryDate: "",
  isActive: true,
};

const isExpired = (expiryDate) => new Date(expiryDate) <= new Date();

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    try {
      const response = await getCouponsApi();
      const list = response.data || [];
      setCoupons(list);
      return list;
    } catch (error) {
      toast.error(error.message || "Failed to load coupons");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getCouponsApi()
      .then((response) => {
        if (active) setCoupons(response.data || []);
      })
      .catch((error) => {
        if (active) toast.error(error.message || "Failed to load coupons");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const discountValue = Number(form.discountValue);
    const minimumOrderAmount = Number(form.minimumOrderAmount);

    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
      toast.error("Code must be 3-32 letters, numbers, underscores, or hyphens");
      return;
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      toast.error("Enter a valid discount value");
      return;
    }
    if (form.discountType === "percentage" && discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100");
      return;
    }
    if (!form.expiryDate) {
      toast.error("Expiry date is required");
      return;
    }
    if (!editingId && new Date(`${form.expiryDate}T23:59:59`) < new Date()) {
      toast.error("Expiry date must be in the future");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code,
        discountType: form.discountType,
        discountValue,
        minimumOrderAmount: Number.isFinite(minimumOrderAmount) ? minimumOrderAmount : 0,
        expiryDate: form.expiryDate,
        isActive: form.isActive,
      };
      if (editingId) {
        await updateCouponApi(editingId, payload);
        toast.success("Coupon updated successfully");
      } else {
        await createCouponApi(payload);
        toast.success("Coupon created successfully");
      }
      setEditingId(null);
      setForm(emptyForm);
      await loadCoupons();
    } catch (error) {
      toast.error(error.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const editCoupon = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderAmount: coupon.minimumOrderAmount,
      expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
      isActive: Boolean(coupon.isActive),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await toggleCouponStatusApi(id);
      toast.success(response.message || "Coupon status updated");
      await loadCoupons();
    } catch (error) {
      toast.error(error.message || "Failed to update coupon status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this coupon?")) return;
    try {
      await deleteCouponApi(id);
      toast.success("Coupon deleted successfully");
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadCoupons();
    } catch (error) {
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-nbt-bronze">
          Promotions & Discounts
        </p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-nbt-espresso">Coupons</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Create and manage discount codes. Discounts are securely validated and recalculated on the server during checkout.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded border border-nbt-champagne bg-white p-5 shadow-sm"
      >
        <h2 className="text-base font-serif font-bold text-nbt-espresso">
          {editingId ? "Edit Coupon" : "Create New Coupon"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              required
              placeholder="e.g. NBT10"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              maxLength={32}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm uppercase focus:border-nbt-bronze focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-nbt-bronze focus:outline-none"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (Rs.)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Discount Value {form.discountType === "percentage" ? "(%)" : "(Rs.)"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              min="0.01"
              max={form.discountType === "percentage" ? 100 : undefined}
              step="0.01"
              placeholder={form.discountType === "percentage" ? "10" : "500"}
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-nbt-bronze focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-nbt-bronze focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Minimum Order Amount (Rs.)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0 (No minimum)"
              value={form.minimumOrderAmount}
              onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value })}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-nbt-bronze focus:outline-none"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 accent-nbt-espresso"
              />
              Active status
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-nbt-espresso px-5 py-2 text-sm font-semibold text-white transition hover:bg-nbt-bronze disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="border border-neutral-300 px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Coupons Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-serif font-bold text-nbt-espresso">
          Existing Coupons ({coupons.length})
        </h2>

        {loading ? (
          <p className="py-6 text-center text-sm text-neutral-500">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="border border-dashed border-nbt-champagne bg-white p-8 text-center text-sm text-neutral-500">
            No coupons created yet. Use the form above to add your first promotion code.
          </p>
        ) : (
          <div className="overflow-x-auto rounded border border-nbt-champagne bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-nbt-champagne bg-nbt-champagne/20 text-xs font-semibold uppercase tracking-wider text-neutral-700">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Min Order</th>
                  <th className="p-3">Expires</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nbt-champagne">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiryDate);
                  return (
                    <tr key={coupon._id} className="transition hover:bg-nbt-cream/30">
                      <td className="p-3">
                        <span className="font-mono font-bold tracking-wider text-nbt-espresso">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="p-3 font-medium">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `Rs. ${coupon.discountValue.toLocaleString()} OFF`}
                      </td>
                      <td className="p-3 text-neutral-600">
                        {coupon.minimumOrderAmount > 0
                          ? `Rs. ${coupon.minimumOrderAmount.toLocaleString()}`
                          : "None"}
                      </td>
                      <td className="p-3 text-neutral-600">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                            expired
                              ? "bg-amber-100 text-amber-800"
                              : coupon.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(coupon._id)}
                            className={`text-xs font-semibold uppercase tracking-wider underline-offset-4 hover:underline ${
                              coupon.isActive ? "text-amber-700" : "text-emerald-700"
                            }`}
                          >
                            {coupon.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => editCoupon(coupon)}
                            className="text-xs font-semibold uppercase tracking-wider text-nbt-bronze underline-offset-4 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon._id)}
                            className="text-xs font-semibold uppercase tracking-wider text-red-600 underline-offset-4 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
