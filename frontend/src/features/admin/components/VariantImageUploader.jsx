import { useState } from "react";
import { uploadImageApi } from "../api/adminApi";

export default function VariantImageUploader({ images = [], onImagesChange, maxLimit = 5, colorName }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > maxLimit) {
      alert(`You can only have a maximum of ${maxLimit} images for ${colorName}.`);
      return;
    }

    setUploading(true);
    try {
      const newUploads = [];
      
      for (const file of files) {
        // Call the API to upload the image - pass file directly
        const response = await uploadImageApi(file);
        
        // Extract url and fileId from the response
        if (response.data && response.data.url) {
          newUploads.push({ 
            url: response.data.url, 
            fileId: response.data.fileId || response.data.publicId 
          });
        }
      }

      onImagesChange([...images, ...newUploads]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image(s).");
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again if needed
      e.target.value = null; 
    }
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-neutral-200 mt-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-neutral-700">
          Color Images <span className="text-xs text-neutral-500 font-normal">({images.length} / {maxLimit})</span>
        </label>
        
        {images.length < maxLimit && (
          <label className="cursor-pointer bg-white border border-neutral-300 text-neutral-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-neutral-50 transition">
            {uploading ? "Uploading..." : "+ Upload Image"}
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.webp"
              multiple 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {images.length === 0 ? (
        <div className="p-4 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded text-center text-xs text-neutral-500">
          No images uploaded for this color yet.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {images.map((img, index) => (
            <div key={index} className="relative group flex-shrink-0">
              <img 
                src={img.url} 
                alt={`${colorName} view ${index + 1}`} 
                className="w-20 h-28 object-cover rounded border border-neutral-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}