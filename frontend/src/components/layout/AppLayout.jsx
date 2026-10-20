import { useState } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

export default function AppLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      {/* MOBILE TOP BAR */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <div className="brand-icon">B</div>
          <span>BuildFlow</span>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation"
        >
          ☰
        </button>
      </header>

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* SIDEBAR */}
      <aside className={mobileMenuOpen ? "sidebar sidebar-open" : "sidebar"}>
        {/* BRAND */}
        <div className="sidebar-brand">
          <div className="brand-icon">B</div>

          <div>
            <div className="brand-name">BuildFlow</div>

            <div className="brand-subtitle">Project Management</div>
          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">▦</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/organizations"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">◇</span>
            Organizations
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">○</span>
            Profile
          </NavLink>
        </nav>

        {/* USER */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.firstName?.charAt(0)?.toUpperCase()}
            {user?.lastName?.charAt(0)?.toUpperCase()}
          </div>

          <div className="user-info">
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>

            <span>{user?.email}</span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN APPLICATION */}
      <div className="app-content">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
