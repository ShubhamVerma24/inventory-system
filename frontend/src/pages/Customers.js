import React, { useState, useEffect } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { customerAPI } from "../utils/api";
import toast from "react-hot-toast";

const EMPTY = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () =>
    customerAPI.getAll().then((r) => setCustomers(r.data)).catch(() => toast.error("Failed to load customers")).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setErrors({}); setShowModal(true); };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await customerAPI.create(form);
      toast.success("Customer added");
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete customer "${c.full_name}"?`)) return;
    try {
      await customerAPI.delete(c.id);
      toast.success("Customer deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete customer");
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Customers</h2>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Add Customer</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {customers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} className="empty-state-icon" />
            <p>No customers yet. Add your first customer.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{c.id}</td>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td style={{ fontSize: "0.8rem" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn--danger btn--icon btn--sm" onClick={() => handleDelete(c)} title="Delete">
                        <Trash2 size={14} />
                      </button>
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
              <span className="modal-title">Add Customer</span>
              <button className="btn btn--ghost btn--icon btn--sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className={`form-input ${errors.full_name ? "error" : ""}`} value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Jane Doe" />
                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className={`form-input ${errors.email ? "error" : ""}`} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving…" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
