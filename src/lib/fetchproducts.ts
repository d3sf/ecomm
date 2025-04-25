// lib/api.ts

import axios from "axios";
import { ProductType } from "./zodvalidation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getProducts(): Promise<ProductType[]> {
  const response = await axios.get(`${API_BASE_URL}/api/products`);
  return response.data.products;
}
