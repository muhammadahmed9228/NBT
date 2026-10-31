import apiClient from "../../../services/apiClient";

export const getPublicHeroSlidesApi = () => {
  return apiClient.get("/home/hero-slides");
};