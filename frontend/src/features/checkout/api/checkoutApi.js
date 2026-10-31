import apiClient from "../../../services/apiClient";

export const createOrderApi = (orderData) => {
  return apiClient.post("/orders", orderData);
};

export const validateCouponApi = (code, subtotal) => {
  return apiClient.post("/coupons/apply", { code, subtotal });
};