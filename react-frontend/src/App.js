import React, { useEffect, useState } from "react";
import { getItems, createItem, deleteItem } from "./services/api";
import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getItems();
      setItems(res.data);
    } catch (err) {
      setError("Backend se connect nahi ho paya");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createItem({ ...form, price: parseFloat(form.price) });
      setForm({ name: "", description: "", price: "" });
      fetchItems();
    } catch (err) {
      setError("Item create karne mein error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      fetchItems();
    } catch (err) {
      setError("Item delete karne mein error");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MyApp — ECS Deployment Demo</h1>
        <span className="env-badge">{process.env.REACT_APP_ENV || "development"}</span>
      </header>

      <main className="app-main">
        <section className="form-section">
          <h2>Naya Item Add Karo</h2>
          <form onSubmit={handleSubmit} className="item-form">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <button type="submit">Add Item</button>
          </form>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="items-section">
          <h2>Items List</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="price">₹{item.price}</span>
                  <button onClick={() => handleDelete(item.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
