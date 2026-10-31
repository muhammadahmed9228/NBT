import apiClient from "../../../services/apiClient";

export const getPublicHeroSlidesApi = (params) => {
  return apiClient.get("/home/hero-slides", {params});
};