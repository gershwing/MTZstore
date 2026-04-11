import axios from "axios";

const cryptixClient = axios.create({
  baseURL: process.env.CRYPTIX_BASE_URL || "https://api.cryptix.io",
  headers: {
    Authorization: `Bearer ${process.env.CRYPTIX_API_KEY}`,
    "Content-Type": "application/json"
  },
  timeout: 15000
});

export default cryptixClient;
