"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ItemSchema = Yup.object().shape({
  title: Yup.string().min(2, "Too short").required("Required"),
  description: Yup.string().min(5, "Too short").required("Required"),
});

export default function ClientDashboard({ name }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/items", { method: "GET", credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
      else if (res.status === 401) {
        Swal.fire({ icon: "error", title: "Unauthorized" }).then(() => window.location.href = "/");
      } else Swal.fire({ icon: "error", title: "Error", text: data.message || "Could not load items" });
    } catch (err) { Swal.fire({ icon: "error", title: "Error", text: "Unexpected error" }); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchItems(); }, []);

  async function handleCreate(values, { setSubmitting, resetForm }) {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) { Swal.fire({ icon: "success", title: "Added", text: "Item created." }); resetForm(); setShowAdd(false); fetchItems(); }
      else Swal.fire({ icon: "error", title: "Error", text: data.message || "Could not create item" });
    } catch { Swal.fire({ icon: "error", title: "Error", text: "Unexpected error" }); }
    finally { setSubmitting(false); }
  }

  async function openDetails(id) {
    try {
      const res = await fetch(`/api/items/${id}`, { method: "GET", credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) setSelected(data.item);
      else Swal.fire({ icon: "error", title: "Error", text: data.message || "Could not fetch item" });
    } catch { Swal.fire({ icon: "error", title: "Error", text: "Unexpected error" }); }
  }

  const filteredItems = items.filter(it =>
    it.title.toLowerCase().includes(search.toLowerCase()) ||
    it.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section style={{ margin: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--primary)", fontSize: 24 }}>
            Welcome back, <span style={{ color: "var(--accent)" }}>{name}</span> 👋
          </h2>
          <p style={{ margin: "6px 0 0", color: "#475569" }}>Here are your items — create and manage them.</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" }}
          />
          <button className="btn secondary" onClick={() => window.location.href = "/"}>Home</button>
          <button className="btn primary" onClick={() => setShowAdd(true)}>+ Add Item</button>
        </div>
      </div>

      <div style={{
        marginTop: 18,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16
      }}>
        {loading ? (
          <div style={{ padding: 24, background: "white", borderRadius: 12, boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 28, gridColumn: "1 / -1" }}>
            <h3 style={{ marginTop: 0, color: "#334155" }}>No items found</h3>
            <p style={{ color: "#64748b" }}>Add your first item to get started.</p>
            <button className="btn primary" onClick={() => setShowAdd(true)}>Create first item</button>
          </div>
        ) : filteredItems.map(it => (
          <article key={it._id} className="card" style={{ padding: 16 }}>
            <h4 style={{ margin: 0, color: "var(--primary)" }}>{it.title}</h4>
            <p style={{ color: "#475569", marginTop: 8 }}>
              {it.description.length > 120 ? it.description.slice(0, 120) + "…" : it.description}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <small style={{ color: "#94a3b8" }}>{new Date(it.createdAt).toLocaleString()}</small>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn secondary" onClick={() => openDetails(it._id)}>View</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 style={{ marginTop: 0 }}>Add new item</h3>
            <Formik initialValues={{ title: "", description: "" }} validationSchema={ItemSchema} onSubmit={handleCreate}>
              {({ isSubmitting }) => (
                <Form style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label className="label">Title</label>
                  <Field name="title" className="input" />
                  <div className="error"><ErrorMessage name="title" /></div>

                  <label className="label">Description</label>
                  <Field as="textarea" name="description" rows="5" className="input" />
                  <div className="error"><ErrorMessage name="description" /></div>

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="btn primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</button>
                    <button className="btn secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{selected.title}</h3>
            <p style={{ color: "#475569", whiteSpace: "pre-wrap" }}>{selected.description}</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <small style={{ color: "#94a3b8" }}>{new Date(selected.createdAt).toLocaleString()}</small>
              <button className="btn secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
