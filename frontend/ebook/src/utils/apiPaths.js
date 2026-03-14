export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GET_PROFILE: "/auth/profile",
    UPDATE_PROFILE: "/auth/profile",
    UPLOAD_AVATAR: "/auth/profile/avatar",
  },

  BOOKS: {
    GET_ALL: "/books",
    GET_ONE: (id) => `/books/${id}`,
    CREATE: "/books",
    UPDATE: (id) => `/books/${id}`,
    DELETE: (id) => `/books/${id}`,
    UPLOAD_COVER: (id) => `/books/cover/${id}`,
  },

  AI: {
    GENERATE_OUTLINE: "/ai/generate-outline",
    GENERATE_CHAPTER_CONTENT: "/ai/generate-chapter-content",
  },

  EXPORT: {
    PDF: (id) => `/export/${id}/pdf`,
    DOC: (id) => `/export/${id}/doc`,
  },
};

export default API_PATHS;
