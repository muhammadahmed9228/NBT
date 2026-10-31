import apiClient from "../../../services/apiClient";

export const getDashboardStatsApi = () => {
    return apiClient.get("/admin/dashboard");
};

// Admin List APIs
export const getAdminProductsApi = (params) => apiClient.get("/products", { params });
export const getAdminOrdersApi = (params) => apiClient.get("/orders", { params });
export const getAdminCustomersApi = () => apiClient.get("/customers");

// Admin Action APIs
export const updateOrderStatusApi = (id, status) => apiClient.patch(`/orders/${id}/status`, { status });
export const createProductApi = (productData) => apiClient.post("/products", productData);
export const checkProductSlugApi = (slug) => apiClient.get("/products/check-slug", { params: { slug } });

export const uploadImageApi = (imageFile) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const extension = imageFile.name.slice(imageFile.name.lastIndexOf(".")).toLowerCase();

  if (!allowedTypes.includes(imageFile.type) || !allowedExtensions.includes(extension)) {
    return Promise.reject(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
  }

  if (imageFile.size > 5 * 1024 * 1024) {
    return Promise.reject(new Error("Image size must be 5MB or less."));
  }

  const formData = new FormData();
  formData.append("image", imageFile);
  return apiClient.post("/uploads/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Hero Slide APIs
export const getHeroSlidesApi = (params) => apiClient.get("/home/hero-slides", {params});
export const createHeroSlideApi = (data) => apiClient.post("/home/hero-slides", data);
export const deleteHeroSlideApi = (id) => apiClient.delete(`/home/hero-slides/${id}`);
export const updateHeroSlideApi = (id, data) => apiClient.patch(`/home/hero-slides/${id}`, data);

//update, delete product (admin)
export const updateProductApi = (id, productData) => apiClient.patch(`/products/${id}`, productData);
export const deleteProductApi = (id) => apiClient.delete(`/products/${id}`);
export const updateProductStockApi = (id, data) => apiClient.patch(`/products/${id}/stock`, data);
export const toggleProductFeaturedApi = (id) => apiClient.patch(`/products/${id}/toggle-featured`);
export const toggleProductStatusApi = (id) => apiClient.patch(`/products/${id}/toggle-status`);
export const bulkUpdateProductsApi = (data) => apiClient.post("/products/bulk-action", data);

// Collection APIs
export const getAdminCollectionsApi = (params) => apiClient.get("/collections", { params });
export const createCollectionApi = (data) => apiClient.post("/collections", data);
export const updateCollectionApi = (id, data) => apiClient.patch(`/collections/${id}`, data);
export const deleteCollectionApi = (id) => apiClient.delete(`/collections/${id}`);

//delete order
export const deleteOrderApi = (id) => apiClient.delete(`/orders/${id}`);

export const getPublicHomeSectionsApi = (params) => apiClient.get("/home-sections", {params}); // <--- Restored this line!
// Home Sections APIs (Dynamic Homepage)
export const getAdminHomeSectionsApi = (params) => apiClient.get("/home-sections", {params});
export const createHomeSectionApi = (data) => apiClient.post("/home-sections", data);
export const updateHomeSectionApi = (id, data) => apiClient.patch(`/home-sections/${id}`, data);
export const deleteHomeSectionApi = (id) => apiClient.delete(`/home-sections/${id}`);

// Announcement APIs
export const getAdminAnnouncementsApi = (params) => apiClient.get("/announcements", { params });
export const saveAnnouncementApi = (data) => {
    if (data.id) return apiClient.put(`/announcements`, data);
    return apiClient.post("/announcements", data);
};
export const deleteAnnouncementApi = (id) => apiClient.delete(`/announcements/${id}`);
export const toggleAnnouncementStatusApi = (id) => apiClient.patch(`/announcements/${id}/toggle-status`);

// Coupon APIs
export const getCouponsApi = (params) => apiClient.get("/coupons", { params });
export const createCouponApi = (data) => apiClient.post("/coupons", data);
export const updateCouponApi = (id, data) => apiClient.patch(`/coupons/${id}`, data);
export const deleteCouponApi = (id) => apiClient.delete(`/coupons/${id}`);
export const toggleCouponStatusApi = (id) => apiClient.patch(`/coupons/${id}/toggle-status`);
