import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductForm from "../components/ProductForm";
import { checkProductSlugApi, createProductApi } from "../api/adminApi";

export default function CreateProductPage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateProduct = async (productData) => {
    if (!productData.thumbnail) {
      toast.error("Please upload a thumbnail image.");
      return;
    }

    const trimmedSlug = String(productData.slug || "").trim();
    if (!trimmedSlug) {
      toast.error("Please enter a product slug.");
      return;
    }

    setSubmitting(true);
    try {
      const slugResponse = await checkProductSlugApi(trimmedSlug);
      if (!slugResponse?.data?.available) {
        toast.error("A product with this slug already exists.");
        setSubmitting(false);
        return;
      }

      await createProductApi({ ...productData, slug: trimmedSlug });
      toast.success("Product created successfully!");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">Create New Product</h1>
        <button onClick={() => navigate("/admin/products")} className="text-neutral-500 hover:text-neutral-900 text-sm font-medium">
          ← Back to Products
        </button>
      </div>
      
      <ProductForm onSubmit={handleCreateProduct} isSubmitting={submitting} />
    </div>
  );
}