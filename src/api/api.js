import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  adminRegister: (data) => api.post("/auth/admin/register", data),
};

export const productAPI = {
  getByBusiness: (businessId) => api.get(`/products/business/${businessId}`),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const customerAPI = {
  getByBusiness: (businessId) => api.get(`/customers/business/${businessId}`),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

const _notImpl = () => Promise.reject(new Error("Not implemented"));

export const supplierAPI = {
  getAll: () => api.get("/suppliers"),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post("/suppliers", data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const batchAPI = {
  create: (data) => api.post("/batches", data),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getBusinesses: () => api.get("/admin/businesses"),
  updateBusinessStatus: (id, value) =>
    api.patch(`/admin/businesses/${id}/status`, null, { params: { value } }),
  updateBusinessPlan: (id, value) =>
    api.patch(`/admin/businesses/${id}/plan`, null, { params: { value } }),
  deleteBusiness: (id) => api.delete(`/admin/businesses/${id}`),
  getUsers: () => api.get("/admin/users"),
  getAiUsageLogs: _notImpl,
  getApiKeys: () => api.get("/admin/api-keys"),
  createApiKey: (data) => api.post("/admin/api-keys", data),
  deleteApiKey: (id) => api.delete(`/admin/api-keys/${id}`),
};

export const dashboardAPI = {
  getSummary: (businessId) => api.get(`/dashboard/${businessId}`),
  getSalesReport: (businessId, from, to) =>
    api.get(`/dashboard/${businessId}/report`, { params: { from, to } }),
};
export const saleAPI = {
  getByBusiness: (businessId) => api.get(`/sales/business/${businessId}`),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post("/sales", data),
  delete: (id) => api.delete(`/sales/${id}`),
};
export const expenseAPI = {
  getAll: _notImpl,
  create: _notImpl,
  update: _notImpl,
  delete: _notImpl,
};
export const reportAPI = {
  getSalesReport: _notImpl,
  getIncomeStatement: _notImpl,
};
export const aiAPI = {
  generateInsight: (question, data = {}) =>
    api.post("/ai/insights", { question, data }).then((res) => ({
      ...res,
      data: { content: res.data?.result ?? "" },
    })),
  generateEmail: (payload) =>
    api
      .post("/ai/compose-email", {
        emailType: payload?.type || "followup",
        recipientName: payload?.customerName || "Customer",
        recipientRole: payload?.recipientRole || "Customer",
        context: payload?.context || "",
        keyPoints: payload?.keyPoints || "",
        tone: payload?.tone || "friendly",
      })
      .then((res) => ({
        ...res,
        data: { email: res.data?.result ?? "" },
      })),
  generateMarketingPost: (payload) =>
    api
      .post("/ai/social-post", {
        platform: payload?.platform || "Facebook",
        businessName: payload?.businessName || "My Business",
        campaignType: payload?.campaignType || payload?.topic || "Promotion",
        offerDetails: payload?.offerDetails || payload?.topic || "",
        targetAudience: payload?.targetAudience || "General customers",
        tone: payload?.tone || "friendly",
      })
      .then((res) => ({
        ...res,
        data: { post: res.data?.result ?? "" },
      })),
};

export default api;
