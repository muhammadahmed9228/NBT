import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAdminHomeSectionsApi,
  createHomeSectionApi,
  updateHomeSectionApi,
  deleteHomeSectionApi,
} from "../api/adminApi";
import HomeSectionForm from "../components/HomeSectionForm";
import Pagination from "../components/Pagination";

export default function AdminHomeSectionsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // NEW: Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("order_asc");
  const [totalPages, setTotalPages] = useState(1);

  const hasActiveFilters = limit !== 10 || sort !== "order_asc";

  const handleClearFilters = () => {
    setLimit(10);
    setSort("order_asc");
    setPage(1);
  };

  useEffect(() => {
    fetchSections();
  }, [page, limit, sort]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await getAdminHomeSectionsApi({ page, limit, sort });
      setSections(response.data.sections || response.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      toast.error("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    setSubmitting(true);
    try {
      if (editingSection) {
        await updateHomeSectionApi(editingSection._id, formData);
        toast.success("Section updated!");
      } else {
        await createHomeSectionApi(formData);
        toast.success("Section created!");
      }
      setShowForm(false);
      setEditingSection(null);
      fetchSections();
    } catch (error) {
      toast.error(error.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;
    try {
      await deleteHomeSectionApi(id);
      toast.success("Section deleted!");
      fetchSections();
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  if (loading)
    return <div className="py-10 text-center">Loading Sections...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold text-nbt-espresso">
          Dynamic Homepage Sections
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-nbt-espresso px-4 py-2 text-sm text-white transition hover:bg-nbt-bronze"
          >
            + Add Section
          </button>
        )}
      </div>

      {showForm && (
        <HomeSectionForm
          initialData={editingSection}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingSection(null);
          }}
          isSubmitting={submitting}
        />
      )}

      {/* NEW: Sorting & Limit Controls */}
      <div className="flex items-center justify-between rounded-lg border border-nbt-champagne bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-neutral-600">Show:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1 text-sm outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-neutral-600">
            Sort by:
          </label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="border rounded px-2 py-1 text-sm outline-none"
          >
            <option value="order_asc">Display Order (Low-High)</option>
            <option value="order_desc">Display Order (High-Low)</option>
            <option value="status_enabled">Enabled First</option>
            <option value="status_disabled">Disabled First</option>
            <option value="newest">Newest Created</option>
            <option value="oldest">Oldest Created</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button type="button" onClick={handleClearFilters} className="text-sm text-red-600 font-medium hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md transition">
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-10 text-center">Loading Sections...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div
                key={section._id}
                className="group relative rounded-lg border border-nbt-champagne bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{section.title}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${section.enabled ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-600"}`}
                  >
                    {section.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mb-4">
                  {section.subtitle || "No subtitle"}
                </p>

                <div className="space-y-1 rounded border border-nbt-champagne/70 bg-nbt-champagne/20 p-3 text-sm">
                  <p>
                    <span className="font-semibold text-neutral-700">
                      Criteria:
                    </span>{" "}
                    {section.criteria.toUpperCase()}
                  </p>
                  {section.criteria === "collection" && (
                    <p>
                      <span className="font-semibold text-neutral-700">
                        Collection:
                      </span>{" "}
                      {section.collectionRef?.name || "N/A"}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-neutral-700">
                      Order:
                    </span>{" "}
                    {section.displayOrder}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="absolute right-2 top-2 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(section)}
                    className="rounded-md border border-nbt-champagne bg-nbt-cream p-2 text-nbt-espresso shadow hover:bg-nbt-champagne"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section._id)}
                    className="bg-red-600 text-white p-2 rounded-md shadow hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} pages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
