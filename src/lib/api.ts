import axios from "axios";
import { supabase } from "./supabase";
import { API_URL } from "../../config";

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
