import axios from "axios";
import { config } from "../config";

const axiosInstance = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
});

export default axiosInstance;
