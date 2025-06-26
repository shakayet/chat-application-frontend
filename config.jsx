import axios from "axios";

const baseUrl = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

export default baseUrl;
