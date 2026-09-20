const USER_STORAGE_KEY = "user";
const TOKEN_STORAGE_KEY = "token";
const validRoles = new Set(["user", "trainer", "admin"]);

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    return user && typeof user === "object" && validRoles.has(user.role)
      ? user
      : null;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const saveSession = ({ token, user }) => {
  if (!token || !user || !validRoles.has(user.role)) {
    throw new Error("The sign-in response did not include a valid session.");
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const getTokenPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const getSession = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const user = getStoredUser();
  const tokenPayload = token ? getTokenPayload(token) : null;
  const tokenIsExpired =
    !tokenPayload?.exp || Number(tokenPayload.exp) * 1000 <= Date.now();

  if (!token || !user || tokenIsExpired) {
    if (token || localStorage.getItem(USER_STORAGE_KEY)) clearSession();
    return null;
  }

  return { token, user };
};

const isSafeReturnPath = (from) =>
  from &&
  typeof from.pathname === "string" &&
  from.pathname.startsWith("/") &&
  !from.pathname.startsWith("//") &&
  !["/login", "/register", "/verify-otp", "/forgot-password"].includes(
    from.pathname,
  );

export const getPostLoginPath = (user, from) => {
  const fallback = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  if (!isSafeReturnPath(from)) return fallback;
  if (from.pathname.startsWith("/admin") && user?.role !== "admin") {
    return fallback;
  }

  return `${from.pathname}${from.search || ""}${from.hash || ""}`;
};
