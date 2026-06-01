import React, { useState, useEffect } from "react";
import { Plus, Trash2, Eye, ShoppingCart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { orderAPI, customerAPI, productAPI } from "../utils/api";
import toast from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([orderAPI.getAll(), customerAPI.getAll(), productAPI.getAll()])
      .then(([o, c, p]) => { setOrders(o.data); setCustomers(c.data); setProducts(p.data); })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setCustomerId(""); setItems([{ product_id: "", quantity: 1 }]); setErrors({}); setShowModal(true);
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => setItems(items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = "Select a customer";
    const invalidItems = items.some((it) => !it.product_id || Number(it.quantity) < 1);
    if (invalidItems) e.items = "All items need a product and quantity ≥ 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await orderAPI.create({
        customer_id: Number(customerId),
        items: items.map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) })),
      });
      toast.success("Order created!");
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o) => {
    if (!window.confirm(`Cancel order #${o.id}?`)) return;
    try {
      await orderAPI.delete(o.id);
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to cancel order");
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Orders</h2>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> New Order</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} className="empty-state-icon" />
            <p>No orders yet. Create the first one.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem" }}>#{o.id}</span></td>
                    <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                    <td>{o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}</td>
                    <td style={{ fontFamily: "var(--font-display)", color: "var(--accent-cyan)" }}>
                      ${Number(o.total_amount).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${o.status === "pending" ? "badge--amber" : "badge--emerald"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
                        <Link to={`/orders/${o.id}`} className="btn btn--ghost btn--icon btn--sm" title="View">
                          <Eye size={14} />
                        </Link>
                        <button className="btn btn--danger btn--icon btn--sm" onClick={() => handleDelete(o)} title="Cancel">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: "620px" }}>
            <div className="modal-header">
              <span className="modal-title">Create New Order</span>
              <button className="btn btn--ghost btn--icon btn--sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className={`form-input form-select ${errors.customer ? "error" : ""}`}
                  value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">— Select a customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
                {errors.customer && <span className="form-error">{errors.customer}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Order Items *</label>
                {items.map((item, i) => (
                  <div key={i} className="order-item-row">
                    <select className="form-input form-select" value={item.product_id}
                      onChange={(e) => updateItem(i, "product_id", e.target.value)}>
                      <option value="">— Product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                          {p.name} (${p.price} · {p.quantity} in stock)
                        </option>
                      ))}
                    </select>
                    <input type="number" min="1" className="form-input" style={{ width: "80px" }}
                      value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} />
                    {items.length > 1 && (
                      <button className="btn btn--ghost btn--icon btn--sm" onClick={() => removeItem(i)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {errors.items && <span className="form-error">{errors.items}</span>}
                <button className="btn btn--ghost btn--sm" onClick={addItem} style={{ marginTop: "8px" }}>
                  <Plus size={14} /> Add Item
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Creating…" : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
