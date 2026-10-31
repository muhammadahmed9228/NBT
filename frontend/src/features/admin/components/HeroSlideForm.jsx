import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";

export default function HeroSlideForm({ onSubmit, onCancel, isSubmitting, initialData = null }) {
  const [formData, setFormData] = useState({
    heading: "", subtitle: "", buttonText: "Shop Now", buttonUrl: "/products", displayOrder: 0, enabled: true, image: null
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold">{initialData ? "Edit Slide" : "Add New Slide"}</h3>
        <button type="button" onClick={onCancel} className="text-sm text-neutral-500 hover:text-neutral-900">Cancel</button>
      </div>

      <ImageUploader 
        label="Slide Background Image" 
        currentImage={formData.image}
        onUploadSuccess={(img) => setFormData(prev => ({ ...prev, image: img }))} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">Heading</label>
          <input type="text" name="heading" required value={formData.heading} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Button Text</label>
          <input type="text" name="buttonText" value={formData.buttonText} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Button URL</label>
          <input type="text" name="buttonUrl" value={formData.buttonUrl} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Display Order</label>
          <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} className="w-4 h-4" />
        <label className="text-sm font-medium">Enable Slide</label>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-neutral-900 text-white py-2 rounded-md hover:bg-neutral-800 disabled:opacity-50 mt-4">
        {isSubmitting ? "Saving..." : (initialData ? "Update Slide" : "Save Slide")}
      </button>
    </form>
  );
}