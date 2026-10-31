import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";

export default function CollectionForm({ onSubmit, onCancel, isSubmitting, initialData = null }) {
  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", displayOrder: 0, enabled: true, image: null
  });

  useEffect(() => {
    if (initialData) setFormData({ ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Auto-generate slug from name if slug is empty or user is typing name
    if (name === "name" && !initialData) {
      const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, name: value, slug: generatedSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold">{initialData ? "Edit Collection" : "Add New Collection"}</h3>
        <button type="button" onClick={onCancel} className="text-sm text-neutral-500 hover:text-neutral-900">Cancel</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Collection Name</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
        <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Display Order (Homepage sorting)</label>
        <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} className="w-full px-3 py-2 border rounded-md md:w-1/3" />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} className="w-4 h-4 cursor-pointer" />
        <label className="text-sm font-medium">Enable Collection</label>
      </div>

      <ImageUploader 
        label="Collection Banner Image (Optional)" 
        currentImage={formData.image}
        onUploadSuccess={(img) => setFormData(prev => ({ ...prev, image: img }))} 
      />

      <button type="submit" disabled={isSubmitting} className="w-full bg-neutral-900 text-white py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 mt-4">
        {isSubmitting ? "Saving..." : (initialData ? "Update Collection" : "Save Collection")}
      </button>
    </form>
  );
}