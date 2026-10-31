import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getHeroSlidesApi,
  createHeroSlideApi,
  updateHeroSlideApi,
  deleteHeroSlideApi,
} from "../api/adminApi";
import HeroSlideForm from "../components/HeroSlideForm";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

export default function AdminHeroPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for form visibility and edit payload
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);

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
    fetchSlides();
  }, [page, limit, sort]);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const response = await getHeroSlidesApi({ page, limit, sort });
      setSlides(response.data.slides || response.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    if (!formData.image) return toast.error("Please upload an image.");
    setSubmitting(true);
    try {
      if (editingSlide) {
        await updateHeroSlideApi(editingSlide._id, formData);
        toast.success("Slide updated!");
      } else {
        await createHeroSlideApi(formData);
        toast.success("Slide created!");
      }
      setShowForm(false);
      setEditingSlide(null);
      fetchSlides();
    } catch (error) {
      toast.error(error.message || "Failed to save slide");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    try {
      await deleteHeroSlideApi(id);
      toast.success("Slide deleted!");
      fetchSlides();
    } catch (error) {
      toast.error("Failed to delete slide");
    }
  };

  if (loading)
    return <div className="py-10 text-center">Loading slides...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold text-qala-espresso">Homepage Carousel</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-qala-espresso px-4 py-2 text-sm text-white transition hover:bg-qala-bronze"
          >
            + Add Slide
          </button>
        )}
      </div>

      {showForm && (
        <HeroSlideForm
          initialData={editingSlide}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingSlide(null);
          }}
          isSubmitting={submitting}
        />
      )}

      {/* NEW: Sorting & Limit Controls */}
      <div className="flex items-center justify-between rounded-lg border border-qala-champagne bg-white p-4 shadow-sm">
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
        <div className="py-10 text-center">Loading slides...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide) => (
              <div
                key={slide._id}
                className="group relative overflow-hidden rounded-lg border border-qala-champagne bg-white shadow-sm"
              >
                <img
                  src={slide.image.url}
                  alt={slide.heading}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{slide.heading}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${slide.enabled ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-600"}`}
                    >
                      {slide.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">{slide.subtitle}</p>
                  <p className="text-xs text-neutral-400">
                    Order: {slide.displayOrder}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="absolute right-2 top-2 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedSlide(slide)}
                    className="rounded-md bg-qala-bronze p-2 text-white shadow transition hover:bg-qala-espresso"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="rounded-md border border-qala-champagne bg-qala-cream p-2 text-qala-espresso shadow hover:bg-qala-champagne"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slide._id)}
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

      <Modal
        isOpen={!!selectedSlide}
        onClose={() => setSelectedSlide(null)}
        title="Slide Preview"
      >
        {selectedSlide && (
          <div className="space-y-4">
            <div className="relative w-full h-64 bg-black rounded overflow-hidden flex items-center justify-center text-center">
              <img
                src={selectedSlide.image.url}
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div className="relative z-10 text-white p-4">
                <h2 className="text-3xl font-serif font-bold mb-2">
                  {selectedSlide.heading}
                </h2>
                <p className="text-lg">{selectedSlide.subtitle}</p>
                <span className="inline-block mt-4 bg-white text-black px-4 py-2 text-sm font-bold rounded">
                  {selectedSlide.buttonText} → {selectedSlide.buttonUrl}
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-sm bg-neutral-50 p-4 rounded">
              <p>
                <strong>Order:</strong> {selectedSlide.displayOrder}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedSlide.enabled ? "Active" : "Disabled"}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
