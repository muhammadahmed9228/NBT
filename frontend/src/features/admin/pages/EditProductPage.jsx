import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductForm from "../components/ProductForm";
import { updateProductApi } from "../api/adminApi";
import { getProductByIdApi } from "../../products/api/productsApi"; // Reuse our public API

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductByIdApi(id);
        setProductData(response.data);
      } catch (error) {
        toast.error("Failed to load product details");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleUpdateProduct = async (updatedData) => {
    if (!updatedData.thumbnail) {
      return toast.error("Please ensure a thumbnail is selected.");
    }

    setSubmitting(true);
    try {
      await updateProductApi(id, updatedData);
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center">Loading product data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">Edit Product</h1>
        <button onClick={() => navigate("/admin/products")} className="text-neutral-500 hover:text-neutral-900 text-sm font-medium">
          ← Back to Products
        </button>
      </div>
      
      <ProductForm 
        initialData={productData} 
        onSubmit={handleUpdateProduct} 
        isSubmitting={submitting} 
      />
    </div>
  );
}