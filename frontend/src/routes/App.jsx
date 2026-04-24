import React from "react";
import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../lib/auth.js";

import LoginPage from "../screens/LoginPage.jsx";
import RegisterPage from "../screens/RegisterPage.jsx";
import DashboardPage from "../screens/DashboardPage.jsx";
import NomineeAccessPage from "../screens/NomineeAccessPage.jsx";
import AdminPage from "../screens/AdminPage.jsx";

function Protected({ children, role }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  const nav = useNavigate();
  const user = getUser();

  return (
    <div className="container">
      <div className="nav">
        <div className="flex">
          <div className="brand">Digital Legacy Manager</div>
          <Link className="muted" to="/app">
            App
          </Link>
          <Link className="muted" to="/nominee-access">
            Nominee Access
          </Link>
          {user?.role === "admin" ? (
            <Link className="muted" to="/admin">
              Admin
            </Link>
          ) : null}
        </div>
        <div className="flex">
          {user ? (
            <>
              <span className="muted">{user.email}</span>
              <button
                className="btn"
                onClick={() => {
                  logout();
                  nav("/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="muted" to="/login">
                Login
              </Link>
              <Link className="muted" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/nominee-access" element={<NomineeAccessPage />} />
        <Route
          path="/app"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected role="admin">
              <AdminPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </div>
  );
}

