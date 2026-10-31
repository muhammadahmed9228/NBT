import apiClient from "../../../services/apiClient";

export const getMyOrdersApi = () => {
  return apiClient.get("/orders/my-orders");
};