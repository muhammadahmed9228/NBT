import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  deleteAnnouncementApi,
  getAdminAnnouncementsApi,
  saveAnnouncementApi,
  toggleAnnouncementStatusApi,
} from "../api/adminApi";

const initialForm = {
  id: "",
  message: "",
  link: "",
  activeStatus: true,
  backgroundColor: "#30251E",
  textColor: "#D8C8B6",
};

const isSafeLink = (link) => {
  const value = String(link || "").trim();
  if (!value) return true;
  if (value.startsWith("//") || value.includes("\\")) return false;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const response = await getAdminAnnouncementsApi();
      const list = response.data || [];
      setAnnouncements(list);
      return list;
    } catch (error) {
      toast.error(error.message || "Failed to load announcements");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getAdminAnnouncementsApi()
      .then((response) => {
        if (!active) return;
        const list = response.data || [];
        setAnnouncements(list);
        const currentActive = list.find((item) => item.activeStatus);
        if (currentActive) {
          setForm({
            id: currentActive._id,
            message: currentActive.message || "",
            link: currentActive.link || "",
            activeStatus: Boolean(currentActive.activeStatus),
            backgroundColor: currentActive.backgroundColor || "#30251E",
            textColor: currentActive.textColor || "#D8C8B6",
          });
        }
      })
      .catch((error) => {
        if (active) toast.error(error.message || "Failed to load announcements");
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
    if (!form.message.trim()) {
      toast.error("Announcement message is required");
      return;
    }
    if (!isSafeLink(form.link)) {
      toast.error("Link must be a relative path (/products) or HTTP(S) URL");
      return;
    }

    setSaving(true);
    try {
      await saveAnnouncementApi({
        ...(form.id ? { id: form.id } : {}),
        message: form.message.trim(),
        link: form.link.trim(),
        activeStatus: form.activeStatus,
        backgroundColor: form.backgroundColor,
        textColor: form.textColor,
      });
      toast.success(form.id ? "Announcement updated successfully" : "Announcement created successfully");
      setForm(initialForm);
      await loadAnnouncements();
    } catch (error) {
      toast.error(error.message || "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement) => {
    setForm({
      id: announcement._id,
      message: announcement.message || "",
      link: announcement.link || "",
      activeStatus: Boolean(announcement.activeStatus),
      backgroundColor: announcement.backgroundColor || "#30251E",
      textColor: announcement.textColor || "#D8C8B6",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await toggleAnnouncementStatusApi(id);
      toast.success(response.message || "Announcement status updated");
      await loadAnnouncements();
    } catch (error) {
      toast.error(error.message || "Failed to toggle announcement status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this announcement?")) return;
    try {
      await deleteAnnouncementApi(id);
      toast.success("Announcement deleted successfully");
      if (form.id === id) setForm(initialForm);
      await loadAnnouncements();
    } catch (error) {
      toast.error(error.message || "Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-nbt-bronze">
          Storefront messaging
        </p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-nbt-espresso">
          Announcement Bar
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Control the prominent top bar shown across the storefront. Only one announcement can be active at a time.
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="rounded border border-nbt-champagne bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Live Storefront Preview
        </p>
        <div
          className="relative flex min-h-9 items-center justify-center rounded px-8 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] sm:text-[11px]"
          style={{
            backgroundColor: form.backgroundColor || "#30251E",
            color: form.textColor || "#D8C8B6",
          }}
        >
          <span className="truncate">
            {form.message.trim() || "Your announcement message will appear here..."}
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-60">
            &times;
          </span>
        </div>
        {form.link && (
          <p className="mt-1 text-[11px] text-neutral-400">
            Links to: <span className="font-mono text-neutral-600">{form.link}</span>
          </p>
        )}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded border border-nbt-champagne bg-white p-5 shadow-sm">
        <h2 className="text-base font-serif font-bold text-nbt-espresso">
          {form.id ? "Edit Announcement" : "Create New Announcement"}
        </h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Message <span className="text-red-500">*</span>
          </label>
          <input
            required
            maxLength={240}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-nbt-bronze focus:outline-none"
            placeholder="e.g. Free shipping on all orders over Rs. 3,000 this week"
          />
          <p className="mt-1 text-xs text-neutral-400">{form.message.length}/240 characters</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Call-to-Action Link <span className="text-xs text-neutral-400">(optional)</span>
          </label>
          <input
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-nbt-bronze focus:outline-none"
            placeholder="e.g. /products or https://..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={form.activeStatus}
              onChange={(e) => setForm({ ...form, activeStatus: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 accent-nbt-espresso"
            />
            Make this active now
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Background:</label>
            <input
              type="color"
              value={form.backgroundColor}
              onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
              className="h-8 w-14 cursor-pointer rounded border border-neutral-300 p-0.5"
            />
            <span className="font-mono text-xs text-neutral-500">{form.backgroundColor}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Text color:</label>
            <input
              type="color"
              value={form.textColor}
              onChange={(e) => setForm({ ...form, textColor: e.target.value })}
              className="h-8 w-14 cursor-pointer rounded border border-neutral-300 p-0.5"
            />
            <span className="font-mono text-xs text-neutral-500">{form.textColor}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-nbt-espresso px-5 py-2 text-sm font-semibold text-white transition hover:bg-nbt-bronze disabled:opacity-50"
          >
            {saving ? "Saving..." : form.id ? "Update Announcement" : "Create Announcement"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(initialForm)}
              className="border border-neutral-300 px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50"
            >
              Cancel / New
            </button>
          )}
        </div>
      </form>

      {/* Announcements List */}
      <div className="space-y-3">
        <h2 className="text-lg font-serif font-bold text-nbt-espresso">
          All Announcements ({announcements.length})
        </h2>

        {loading ? (
          <p className="py-6 text-center text-sm text-neutral-500">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="border border-dashed border-nbt-champagne bg-white p-8 text-center text-sm text-neutral-500">
            No announcements created yet. Use the form above to add your first announcement.
          </p>
        ) : (
          <div className="divide-y divide-nbt-champagne border border-nbt-champagne bg-white shadow-sm">
            {announcements.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        item.activeStatus
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {item.activeStatus ? "Active" : "Inactive"}
                    </span>
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-neutral-300"
                      style={{ backgroundColor: item.backgroundColor }}
                      title={`Background: ${item.backgroundColor}`}
                    />
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-neutral-300"
                      style={{ backgroundColor: item.textColor }}
                      title={`Text: ${item.textColor}`}
                    />
                  </div>
                  <p className="text-sm font-medium text-neutral-900">{item.message}</p>
                  {item.link && (
                    <p className="truncate text-xs text-neutral-500">
                      Link: <span className="font-mono">{item.link}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-400">
                    Last updated: {new Date(item.updatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item._id)}
                    className={`text-xs font-semibold uppercase tracking-wider underline-offset-4 hover:underline ${
                      item.activeStatus ? "text-amber-700" : "text-emerald-700"
                    }`}
                  >
                    {item.activeStatus ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="text-xs font-semibold uppercase tracking-wider text-nbt-bronze underline-offset-4 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="text-xs font-semibold uppercase tracking-wider text-red-600 underline-offset-4 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
