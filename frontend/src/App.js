import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { background: "#1a1a2e", color: "#e2e8f0", border: "1px solid #334155" },
          success: { iconTheme: { primary: "#22d3ee", secondary: "#1a1a2e" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#1a1a2e" } },
        }}
      />

      <div className="app-layout">
        {/* Sidebar Overlay (mobile) */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
          <div className="sidebar-header">
            <BarChart3 size={24} className="sidebar-logo-icon" />
            <span className="sidebar-logo-text">StockFlow</span>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "sidebar-nav-item--active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <span className="sidebar-version">v1.0.0</span>
          </div>
        </aside>

        {/* Main Content */}
        <div className="main-wrapper">
          <header className="topbar">
            <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="topbar-title">Inventory &amp; Order Management</h1>
          </header>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
