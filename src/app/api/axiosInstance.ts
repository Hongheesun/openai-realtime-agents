import axios from "axios";

const talkerIdMatch = location.pathname.match(/\/setting\/talker\/(\d+)/);
const talkerId = talkerIdMatch ? Number(talkerIdMatch[1]) : undefined;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    Authorization: `Bearer ${talkerId}`,
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const talkerIdMatch = location.pathname.match(/\/setting\/talker\/(\d+)/);
  const talkerId = talkerIdMatch ? Number(talkerIdMatch[1]) : undefined;

  if (talkerId) {
    config.headers.Authorization = `Bearer ${talkerId}`;
  }
  return config;
});

export default axiosInstance;
