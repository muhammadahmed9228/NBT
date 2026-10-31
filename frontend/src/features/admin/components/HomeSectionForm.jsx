import { useState, useEffect } from "react";
import { getAdminCollectionsApi } from "../api/adminApi";

export default function HomeSectionForm({ onSubmit, onCancel, isSubmitting, initialData = null }) {
  const [collections, setCollections] = useState([]);
  const [formData, setFormData] = useState({
    title: "", subtitle: "", criteria: "newest", collectionRef: "", displayOrder: 0, enabled: true
  });

  useEffect(() => {
    // Fetch collections for the dropdown
    getAdminCollectionsApi({ limit: 100 })
    .then(res => setCollections(res.data.collections || res.data))
    .catch(console.error);

    if (initialData) {
      setFormData({
        title: initialData.title || "",
        subtitle: initialData.subtitle || "",
        criteria: initialData.criteria || "newest",
        collectionRef: initialData.collectionRef?._id || initialData.collectionRef || "",
        displayOrder: initialData.displayOrder || 0,
        enabled: initialData.enabled ?? true
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      collectionRef: formData.criteria === "collection" ? (formData.collectionRef || null) : null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold">{initialData ? "Edit Section" : "Add New Section"}</h3>
        <button type="button" onClick={onCancel} className="text-sm text-neutral-500 hover:text-neutral-900">Cancel</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Section Title</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle (Optional)</label>
          <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Content Criteria</label>
          <select name="criteria" value={formData.criteria} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-white">
            <option value="newest">Newest Arrivals</option>
            <option value="bestselling">Bestselling Products</option>
            <option value="featured">Featured Products</option>
            <option value="collection">Specific Collection</option>
          </select>
        </div>

        {/* Only show Collection dropdown if criteria is 'collection' */}
        {formData.criteria === "collection" && (
          <div>
            <label className="block text-sm font-medium mb-1">Select Collection</label>
            <select name="collectionRef" required value={formData.collectionRef} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-white">
              <option value="">-- Choose a Collection --</option>
              {collections.map(col => (
                <option key={col._id} value={col._id}>{col.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Display Order</label>
          <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} className="w-4 h-4" />
        <label className="text-sm font-medium">Enable Section</label>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-neutral-900 text-white py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 mt-4">
        {isSubmitting ? "Saving..." : (initialData ? "Update Section" : "Save Section")}
      </button>
    </form>
  );
}