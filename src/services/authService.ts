import { request, setStoredToken, clearStoredAuth, getStoredToken } from "@/lib/api";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  JwtPayload,
  BackendLoginResponse,
  BackendRegisterResponse,
} from "@/types/auth";

const USER_STORAGE_KEY = "llm_gateway_user";

/**
 * Safely decodes a JWT token on the client without external libraries.
 */
export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function formatDisplayName(email: string): string {
  const username = email.split("@")[0] || "User";
  return username
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const authService = {
  /**
   * Log in user with email and password via /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await request<BackendLoginResponse>("/api/auth/login", {
        method: "POST",
        data: credentials,
      });

      if (!response.token) {
        throw new Error("Login failed: no access token returned by server");
      }

      setStoredToken(response.token);

      // Decode JWT token to extract claims
      const claims = parseJwt(response.token);
      const prevStored = this.getStoredUser();

      const resolvedName =
        prevStored && prevStored.email === credentials.email && prevStored.name
          ? prevStored.name
          : formatDisplayName(credentials.email);

      const user: User = {
        id: String(claims?.userId || prevStored?.id || "user"),
        name: resolvedName,
        email: credentials.email,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }

      return {
        token: response.token,
        user,
        message: response.message || "Login Successful",
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new user with name, email and password via /api/auth/register
   * Follows standard onboarding: registers then automatically authenticates
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await request<BackendRegisterResponse>("/api/auth/register", {
        method: "POST",
        data: credentials,
      });

      // Save known profile details in localStorage
      const userProfile: User = {
        id: String(response.user?.id || ""),
        name: credentials.name,
        email: credentials.email,
        createdAt: response.user?.createdAt || response.user?.createAt,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
      }

      // Automatically log the user in to establish the authenticated session
      const authSession = await this.login({
        email: credentials.email,
        password: credentials.password,
      });

      // Ensure user has the registered name
      if (authSession.user) {
        authSession.user.name = credentials.name;
        if (typeof window !== "undefined") {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authSession.user));
        }
      }

      return authSession;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get cached or locally stored user
   */
  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const userRaw = localStorage.getItem(USER_STORAGE_KEY);
      return userRaw ? JSON.parse(userRaw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch current user profile from token & storage
   */
  async getCurrentUser(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;

    // Check if token is expired
    const claims = parseJwt(token);
    if (claims?.exp && claims.exp * 1000 < Date.now()) {
      this.logout();
      return null;
    }

    return this.getStoredUser();
  },

  /**
   * Clear session
   */
  logout(): void {
    clearStoredAuth();
  },

  /**
   * Demo/Offline fallback authentication for rapid local testing
   */
  async mockAuthenticate(user: User): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const token = `mock_jwt_token_${Date.now()}`;
    setStoredToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    return { token, user, message: "Demo authentication successful" };
  },
};


