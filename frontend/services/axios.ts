import { getBackendUrl } from "@/utils/config";
import axios from "axios";

const backendUrl = getBackendUrl();

export const instance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});
