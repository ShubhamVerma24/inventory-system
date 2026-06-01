import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { orderAPI } from "../utils/api";
import toast from "react-hot-toast";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id)
      .then((r) => setOrder(r.data))
      .catch(() => toast.error("Order not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Cancel order #${id}?`)) return;
    try {
      await orderAPI.delete(id);
      toast.success("Order cancelled");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to cancel");
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!order) return <div className="empty-state"><p>Order not found.</p></div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/orders" className="btn btn--ghost btn--icon btn--sm"><ArrowLeft size={16} /></Link>
          <h2 className="page-title">Order #{order.id}</h2>
          <span className={`badge ${order.status === "pending" ? "badge--amber" : "badge--emerald"}`}>
            {order.status}
          </span>
        </div>
        <button className="btn btn--danger" onClick={handleDelete}><Trash2 size={14} /> Cancel Order</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Customer Info */}
        <div className="card">
          <div className="card-header"><span className="card-title">Customer</span></div>
          {order.customer ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600 }}>{order.customer.full_name}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{order.customer.email}</div>
              {order.customer.phone && <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{order.customer.phone}</div>}
            </div>
          ) : <p style={{ color: "var(--text-muted)" }}>Customer #{order.customer_id}</p>}
        </div>

        {/* Order Summary */}
        <div className="card">
          <div className="card-header"><span className="card-title">Summary</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Order Date</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Items</span>
              <span>{order.items?.length}</span>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>
              <span>Total</span>
              <span style={{ color: "var(--accent-cyan)" }}>${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card" style={{ marginTop: "20px" }}>
        <div className="card-header"><span className="card-title">Order Items</span></div>
        <div className="table-wrapper">
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Unit Price</th><th>Quantity</th><th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.product?.name || `Product #${item.product_id}`}</td>
                  <td>{item.product?.sku ? <span className="sku-code">{item.product.sku}</span> : "—"}</td>
                  <td>${Number(item.unit_price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td style={{ fontFamily: "var(--font-display)", color: "var(--accent-cyan)" }}>
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
