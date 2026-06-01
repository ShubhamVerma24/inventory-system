import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { productAPI } from "../utils/api";
import toast from "react-hot-toast";

const EMPTY = { name: "", sku: "", price: "", quantity: "", description: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () =>
    productAPI.getAll().then((r) => setProducts(r.data)).catch(() => toast.error("Failed to load products")).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setErrors({}); setEditProduct(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || "" });
    setErrors({});
    setEditProduct(p);
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.sku.trim()) e.sku = "Required";
    if (!form.price || Number(form.price) <= 0) e.price = "Must be > 0";
    if (form.quantity === "" || Number(form.quantity) < 0) e.quantity = "Must be ≥ 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
    try {
      if (editProduct) {
        await productAPI.update(editProduct.id, payload);
        toast.success("Product updated");
      } else {
        await productAPI.create(payload);
        toast.success("Product created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await productAPI.delete(p.id);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete product");
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Products</h2>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Add Product</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} className="empty-state-icon" />
            <p>No products yet. Add your first product.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Description</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="sku-code">{p.sku}</span></td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? "badge--rose" : p.quantity <= 5 ? "badge--amber" : "badge--emerald"}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.description || "—"}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn--ghost btn--icon btn--sm" onClick={() => openEdit(p)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn--danger btn--icon btn--sm" onClick={() => handleDelete(p)} title="Delete">
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
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editProduct ? "Edit Product" : "Add Product"}</span>
              <button className="btn btn--ghost btn--icon btn--sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className={`form-input ${errors.name ? "error" : ""}`} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Mouse" />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code *</label>
                <input className={`form-input ${errors.sku ? "error" : ""}`} value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WM-001" />
                {errors.sku && <span className="form-error">{errors.sku}</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input type="number" step="0.01" min="0.01" className={`form-input ${errors.price ? "error" : ""}`}
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                  {errors.price && <span className="form-error">{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input type="number" min="0" className={`form-input ${errors.quantity ? "error" : ""}`}
                    value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
                  {errors.quantity && <span className="form-error">{errors.quantity}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving…" : editProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
