import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../../utils/auth";

// Client-side protection keeps private screens out of the UI. The API verifies
// the bearer token and role again, so browser storage is never the authority.
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  if (adminOnly && session.user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
