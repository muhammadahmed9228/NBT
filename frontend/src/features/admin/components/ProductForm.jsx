import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import VariantImageUploader from "./VariantImageUploader";
import { getAdminCollectionsApi } from "../api/adminApi";

export default function ProductForm({
  onSubmit,
  isSubmitting,
  initialData = null,
}) {
  const [collections, setCollections] = useState([]);
  const [measurementInput, setMeasurementInput] = useState(""); // For adding custom measurements

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: 0,
    discount: 0,
    published: false,
    isFeatured: false,
    thumbnail: null,
    collectionRef: "",
    sizeChartImage: null, // NEW
    customSizing: {
      // NEW
      enabled: false,
      surcharge: 0,
      requiredMeasurements: [],
    },
  });

  const [variants, setVariants] = useState([]);

  // Fetch collections for dropdown
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await getAdminCollectionsApi({ limit: 100 });
        setCollections(response.data.collections || response.data);
      } catch (error) {
        console.error("Failed to load collections for form");
      }
    };
    fetchCollections();
  }, []);

  // Pre-fill form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        basePrice: initialData.basePrice || 0,
        discount: initialData.discount || 0,
        published: initialData.published || false,
        isFeatured: initialData.isFeatured || false,
        thumbnail: initialData.thumbnail || null,
        collectionRef:
          initialData.collectionRef?._id || initialData.collectionRef || "",
        sizeChartImage: initialData.sizeChartImage || null,
        customSizing: {
          enabled: initialData.customSizing?.enabled || false,
          surcharge: initialData.customSizing?.surcharge || 0,
          requiredMeasurements:
            initialData.customSizing?.requiredMeasurements || [],
        },
      });

      // Clean up priceVariation if it still exists in old variant data
      const cleanedVariants = (initialData.variants || []).map((variant) => ({
        ...variant,
        sizes: variant.sizes.map((size) => {
          const { priceVariation, ...restSize } = size;
          return restSize;
        }),
      }));
      setVariants(cleanedVariants);
    }
  }, [initialData]);

  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // NEW: Automatically generate URL-friendly slug when typing the name
      if (name === "name") {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") // Replace spaces and special chars with a dash
          .replace(/(^-|-$)+/g, ""); // Remove leading or trailing dashes
      }

      return updated;
    });
  };

  // --- CUSTOM SIZING FUNCTIONS ---
  const handleCustomSizingToggle = (e) => {
    setFormData((prev) => ({
      ...prev,
      customSizing: { ...prev.customSizing, enabled: e.target.checked },
    }));
  };

  const handleSurchargeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      customSizing: { ...prev.customSizing, surcharge: Number(e.target.value) },
    }));
  };

  const addMeasurement = (e) => {
    e.preventDefault();
    if (
      measurementInput.trim() &&
      !formData.customSizing.requiredMeasurements.includes(
        measurementInput.trim(),
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        customSizing: {
          ...prev.customSizing,
          requiredMeasurements: [
            ...prev.customSizing.requiredMeasurements,
            measurementInput.trim(),
          ],
        },
      }));
      setMeasurementInput("");
    }
  };

  const removeMeasurement = (fieldToRemove) => {
    setFormData((prev) => ({
      ...prev,
      customSizing: {
        ...prev.customSizing,
        requiredMeasurements: prev.customSizing.requiredMeasurements.filter(
          (m) => m !== fieldToRemove,
        ),
      },
    }));
  };

  // --- VARIANT MANAGEMENT FUNCTIONS ---
  const addVariant = () => {
    setVariants([
      ...variants,
      { colorName: "", colorCode: "#000000", images: [], sizes: [] },
    ]);
  };

  const removeVariant = (vIndex) => {
    const updated = [...variants];
    updated.splice(vIndex, 1);
    setVariants(updated);
  };

  const addSizeToVariant = (vIndex) => {
    const updated = [...variants];
    // REMOVED priceVariation from sizes here
    updated[vIndex].sizes.push({ size: "", sku: "", stock: 0 });
    setVariants(updated);
  };

  const removeSizeFromVariant = (vIndex, sIndex) => {
    const updated = [...variants];
    updated[vIndex].sizes.splice(sIndex, 1);
    setVariants(updated);
  };

  const updateSize = (vIndex, sIndex, field, value) => {
    const updated = [...variants];
    updated[vIndex].sizes[sIndex][field] = value;
    setVariants(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, variants });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2">Basic Details</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleBasicChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Slug (URL friendly)
            </label>
            <input
              type="text"
              name="slug"
              required
              value={formData.slug}
              onChange={handleBasicChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            required
            rows="3"
            value={formData.description}
            onChange={handleBasicChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Base Price (Rs.)
            </label>
            <input
              type="number"
              name="basePrice"
              required
              min="0"
              value={formData.basePrice}
              onChange={handleBasicChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleBasicChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Collection</label>
            <select
              name="collectionRef"
              value={formData.collectionRef}
              onChange={handleBasicChange}
              className="w-full px-3 py-2 border rounded-md bg-white"
            >
              <option value="">-- None --</option>
              {collections.map((col) => (
                <option key={col._id} value={col._id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleBasicChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label className="text-sm font-medium">Publish immediately</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleBasicChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label className="text-sm font-medium">Mark as Featured</label>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploader
            label="Primary Thumbnail Image"
            currentImage={formData.thumbnail}
            onUploadSuccess={(img) =>
              setFormData((prev) => ({ ...prev, thumbnail: img }))
            }
          />
          {/* NEW: Size Chart Uploader */}
          <ImageUploader
            label="Size Chart Image (Optional)"
            currentImage={formData.sizeChartImage}
            onUploadSuccess={(img) =>
              setFormData((prev) => ({ ...prev, sizeChartImage: img }))
            }
          />
        </div>
      </div>

      {/* NEW: Custom Sizing Config */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">Custom Sizing Options</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-indigo-700">
              Enable Custom Size:
            </label>
            <input
              type="checkbox"
              checked={formData.customSizing.enabled}
              onChange={handleCustomSizingToggle}
              className="w-5 h-5 cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {formData.customSizing.enabled ? (
          <div className="space-y-4 pt-2">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium mb-1">
                Custom Size Surcharge (Rs.)
              </label>
              <input
                type="number"
                min="0"
                value={formData.customSizing.surcharge}
                onChange={handleSurchargeChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Extra cost for custom stitching"
              />
              <p className="text-xs text-neutral-500 mt-1">
                This amount will be added to the base price when customers
                select 'CUSTOM'.
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">
                Required Measurements
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={measurementInput}
                  onChange={(e) => setMeasurementInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border rounded-md"
                  placeholder="e.g., Chest, Waist, Shirt Length"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addMeasurement(e);
                  }}
                />
                <button
                  type="button"
                  onClick={addMeasurement}
                  className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded text-sm font-medium hover:bg-neutral-300"
                >
                  Add Field
                </button>
              </div>

              {/* Tags Display */}
              <div className="flex flex-wrap gap-2">
                {formData.customSizing.requiredMeasurements.length === 0 && (
                  <p className="text-xs text-neutral-500 italic">
                    No measurements added. Please add required fields above.
                  </p>
                )}
                {formData.customSizing.requiredMeasurements.map(
                  (measure, idx) => (
                    <div
                      key={idx}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {measure}
                      <button
                        type="button"
                        onClick={() => removeMeasurement(measure)}
                        className="text-indigo-400 hover:text-indigo-700 font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500 italic">
            Custom sizing is disabled for this product.
          </p>
        )}
      </div>

      {/* Variants (Colors & Sizes) */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">Product Variants (Colors)</h3>
          <button
            type="button"
            onClick={addVariant}
            className="text-sm bg-neutral-900 text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition"
          >
            + Add Color Variant
          </button>
        </div>

        {variants.map((variant, vIndex) => (
          <div
            key={vIndex}
            className="p-4 border border-neutral-300 rounded-md bg-neutral-50 space-y-4"
          >
            {/* Color Config Row */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">
                  Color Name
                </label>
                <input
                  type="text"
                  value={variant.colorName}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[vIndex].colorName = e.target.value;
                    setVariants(updated);
                  }}
                  className="w-full px-2 py-1.5 text-sm border rounded"
                  placeholder="e.g., Crimson Red"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Color Hex
                </label>
                <input
                  type="color"
                  value={variant.colorCode}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[vIndex].colorCode = e.target.value;
                    setVariants(updated);
                  }}
                  className="h-8 w-16 border rounded cursor-pointer p-0.5 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariant(vIndex)}
                className="mb-0.5 bg-red-100 text-red-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-200 transition"
              >
                Remove Color
              </button>
            </div>

            {/* Multi-Image Uploader */}
            <VariantImageUploader
              images={variant.images || []}
              colorName={variant.colorName || "this color"}
              onImagesChange={(newImages) => {
                const updated = [...variants];
                updated[vIndex].images = newImages;
                setVariants(updated);
              }}
            />

            {/* Sizes Array for this Variant */}
            <div className="pl-4 border-l-2 border-amber-500 space-y-3 pt-2 mt-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">
                  Standard Sizes & Inventory
                </h4>
                <button
                  type="button"
                  onClick={() => addSizeToVariant(vIndex)}
                  className="text-xs bg-white border border-neutral-300 px-2 py-1 rounded hover:bg-neutral-100 font-medium"
                >
                  + Add Size
                </button>
              </div>

              {variant.sizes.map((size, sIndex) => (
                <div key={sIndex} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-500 mb-1">
                      Size (e.g. Medium)
                    </label>
                    <input
                      type="text"
                      value={size.size}
                      onChange={(e) =>
                        updateSize(vIndex, sIndex, "size", e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border rounded bg-white"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-500 mb-1">
                      SKU (Auto-generated if blank)
                    </label>
                    <input
                      type="text"
                      value={size.sku}
                      onChange={(e) =>
                        updateSize(vIndex, sIndex, "sku", e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border rounded bg-white placeholder:text-neutral-300"
                      placeholder="Leave blank to auto-generate"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-neutral-500 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={size.stock}
                      onChange={(e) =>
                        updateSize(
                          vIndex,
                          sIndex,
                          "stock",
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-2 py-1.5 text-sm border rounded bg-white"
                      required
                    />
                  </div>
                  {/* REMOVED +Price Input */}

                  <button
                    type="button"
                    onClick={() => removeSizeFromVariant(vIndex, sIndex)}
                    className="mb-0.5 text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded border border-red-100 transition"
                    title="Remove Size"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-neutral-900 text-white py-3 rounded-md hover:bg-neutral-800 font-bold disabled:opacity-50 text-lg transition"
      >
        {isSubmitting ? "Saving Product..." : "Save Product"}
      </button>
    </form>
  );
}
