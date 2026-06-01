import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import { dashboardAPI } from "../utils/api";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getSummary()
      .then((res) => setSummary(res.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const stats = summary
    ? [
        { label: "Total Products", value: summary.total_products, icon: Package, color: "cyan", to: "/products" },
        { label: "Total Customers", value: summary.total_customers, icon: Users, color: "emerald", to: "/customers" },
        { label: "Total Orders", value: summary.total_orders, icon: ShoppingCart, color: "amber", to: "/orders" },
        {
          label: "Total Revenue",
          value: `$${Number(summary.total_revenue).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          icon: DollarSign,
          color: "violet",
          to: "/orders",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Overview</h2>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <Link to={s.to} key={s.label} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`stat-icon stat-icon--${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="stat-body">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Low Stock */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠ Low Stock Alert</span>
            <Link to="/products" className="btn btn--ghost btn--sm">View All</Link>
          </div>
          {summary?.low_stock_products?.length === 0 ? (
            <div className="empty-state" style={{ padding: "30px 0" }}>
              <p>All products are well stocked 🎉</p>
            </div>
          ) : (
            <div className="low-stock-list">
              {summary?.low_stock_products?.map((p) => (
                <div key={p.id} className="low-stock-item">
                  <div>
                    <div className="low-stock-item__name">{p.name}</div>
                    <span className="sku-code">{p.sku}</span>
                  </div>
                  <span
                    className={`low-stock-item__qty ${
                      p.quantity === 0 ? "low-stock-item__qty--critical" : "low-stock-item__qty--warning"
                    }`}
                  >
                    {p.quantity === 0 ? "OUT OF STOCK" : `${p.quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link to="/products" className="btn btn--ghost" style={{ justifyContent: "flex-start" }}>
              <Package size={16} /> Manage Products
            </Link>
            <Link to="/customers" className="btn btn--ghost" style={{ justifyContent: "flex-start" }}>
              <Users size={16} /> Manage Customers
            </Link>
            <Link to="/orders" className="btn btn--ghost" style={{ justifyContent: "flex-start" }}>
              <ShoppingCart size={16} /> View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
