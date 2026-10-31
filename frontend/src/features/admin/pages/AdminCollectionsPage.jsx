import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAdminCollectionsApi,
  createCollectionApi,
  updateCollectionApi,
  deleteCollectionApi,
} from "../api/adminApi";
import CollectionForm from "../components/CollectionForm";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // NEW: Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("order_asc");
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");

  const hasActiveFilters = limit !== 10 || sort !== "order_asc" || status !== "";

  const handleClearFilters = () => {
    setLimit(10);
    setSort("order_asc");
    setStatus("");
    setPage(1);
  };

  useEffect(() => {
    fetchCollections();
  }, [page, limit, sort, status]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const params = { page, limit, sort };
      if (status) params.status = status;

      const response = await getAdminCollectionsApi(params);
      setCollections(response.data.collections || response.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    setSubmitting(true);
    try {
      if (editingCollection) {
        await updateCollectionApi(editingCollection._id, formData);
        toast.success("Collection updated!");
      } else {
        await createCollectionApi(formData);
        toast.success("Collection created!");
      }
      setShowForm(false);
      setEditingCollection(null);
      fetchCollections();
    } catch (error) {
      toast.error(error.message || "Failed to save collection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection?"))
      return;
    try {
      await deleteCollectionApi(id);
      toast.success("Collection deleted!");
      fetchCollections();
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  if (loading)
    return <div className="py-10 text-center">Loading collections...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Manage Collections</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-800 text-sm"
          >
            + Add Collection
          </button>
        )}
      </div>

      {showForm && (
        <CollectionForm
          initialData={editingCollection}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingCollection(null);
          }}
          isSubmitting={submitting}
        />
      )}

      {/* NEW: Sorting & Limit Controls */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-neutral-200 gap-4">
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

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-600">
              Status:
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="border rounded px-2 py-1 text-sm outline-none"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
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
        <div className="py-10 text-center">Loading collections...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Collection
                  </th>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Slug
                  </th>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Order
                  </th>
                  <th className="px-6 py-3 font-medium text-neutral-500">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium text-neutral-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {collections.map((col) => (
                  <tr key={col._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {col.name}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">{col.slug}</td>
                    <td className="px-6 py-4">{col.displayOrder}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${col.enabled ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}`}
                      >
                        {col.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCollection(col)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(col)}
                        className="text-indigo-600 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(col._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {collections.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-neutral-500"
                    >
                      No collections found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* NEW: Render Pagination */}
          <Pagination page={page} pages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
        title="Collection Details"
      >
        {selectedCollection && (
          <div className="space-y-4 text-sm">
            {selectedCollection.image?.url ? (
              <img
                src={selectedCollection.image.url}
                alt={selectedCollection.name}
                className="w-full h-48 object-cover rounded border"
              />
            ) : (
              <div className="w-full h-32 bg-neutral-200 flex items-center justify-center rounded">
                No Banner Image
              </div>
            )}
            <div>
              <p className="text-xl font-serif font-bold">
                {selectedCollection.name}
              </p>
              <p className="text-neutral-500 mb-2">
                /{selectedCollection.slug}
              </p>
              <p>
                {selectedCollection.description || "No description provided."}
              </p>
            </div>
            <div className="flex gap-4 border-t pt-4">
              <p>
                <strong>Status:</strong>{" "}
                {selectedCollection.enabled ? "Enabled" : "Disabled"}
              </p>
              <p>
                <strong>Display Order:</strong>{" "}
                {selectedCollection.displayOrder}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
