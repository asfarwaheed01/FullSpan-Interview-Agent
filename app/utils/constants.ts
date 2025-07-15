// utils/tokenUtils.ts

interface DecodedToken {
  id: string;
  username?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Get the authentication token from localStorage
 * @returns {string | null} The token if it exists, null otherwise
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") {
    // Return null during SSR
    return null;
  }

  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Error reading token from localStorage:", error);
    return null;
  }
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The token to store
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("token", token);
  } catch (error) {
    console.error("Error storing token in localStorage:", error);
  }
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Error removing token from localStorage:", error);
  }
};

/**
 * Check if a token exists in localStorage
 * @returns {boolean} True if token exists, false otherwise
 */
export const hasToken = (): boolean => {
  return getToken() !== null;
};

/**
 * Decode JWT token payload (without verification)
 * @param {string} token - The JWT token to decode
 * @returns {any | null} The decoded payload or null if invalid
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Get a valid token from localStorage, removing it if expired
 * @returns {string | null} Valid token or null if no valid token exists
 */
export const getValidToken = (): string | null => {
  const token = getToken();

  if (!token) return null;

  if (isTokenExpired(token)) {
    removeToken();
    return null;
  }

  return token;
};

/**
 * Get authorization header with Bearer token
 * @returns {Object | null} Authorization header object or null if no token
 */
export const getAuthHeader = (): { Authorization: string } | null => {
  const token = getValidToken();

  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Create authenticated fetch headers
 * @param {HeadersInit} additionalHeaders - Additional headers to include
 * @returns {HeadersInit} Complete headers object with auth and content-type
 */
export const createAuthHeaders = (
  additionalHeaders: HeadersInit = {}
): HeadersInit => {
  const authHeader = getAuthHeader();

  return {
    "Content-Type": "application/json",
    ...(authHeader && authHeader),
    ...additionalHeaders,
  };
};

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = createAuthHeaders(options.headers);

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * Token storage event listener for cross-tab synchronization
 * @param {function} callback - Callback function to execute when token changes
 * @returns {function} Cleanup function to remove the event listener
 */
export const onTokenChange = (
  callback: (token: string | null) => void
): (() => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "token") {
      callback(e.newValue);
    }
  };

  window.addEventListener("storage", handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
};
