export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://neurotone-docker.onrender.com';

export const API_ENDPOINTS = {
  voiceAnalyze: `${API_BASE_URL}/analyze`,
  scribbleAnalyze: `${API_BASE_URL}/scribble`,
  report: `${API_BASE_URL}/report`,
};
