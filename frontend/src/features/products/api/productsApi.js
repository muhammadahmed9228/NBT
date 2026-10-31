import apiClient from "../../../services/apiClient";

export const getProductsApi = (params) => {
  // params can include: search, collection, sort, page, limit
  return apiClient.get("/products", { params });
};

export const getProductByIdApi = (id) => {
  return apiClient.get(`/products/${id}`);
};

export const getPublicCollectionsApi = () => apiClient.get("/collections");
export const getCollectionBySlugApi = (slug) => apiClient.get(`/collections/slug/${slug}`);