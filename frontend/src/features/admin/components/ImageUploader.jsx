import { useState } from "react";
import { toast } from "react-toastify";
import { uploadImageApi } from "../api/adminApi";

export default function ImageUploader({ label, onUploadSuccess, currentImage }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadImageApi(file);
      toast.success("Image uploaded successfully!");
      onUploadSuccess({ url: response.data.url, fileId: response.data.fileId });
    } catch (error) {
      toast.error(error.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-neutral-300 rounded-md p-4 bg-neutral-50">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {currentImage?.url && (
          <img src={currentImage.url} alt="Preview" className="w-16 h-20 object-cover rounded border" />
        )}
        <input 
          type="file" 
            accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange} 
          disabled={uploading}
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800"
        />
        {uploading && <span className="text-sm text-neutral-500">Uploading...</span>}
      </div>
    </div>
  );
}