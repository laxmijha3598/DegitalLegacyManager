import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../lib/auth.js";

export default function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      nav("/app");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row">
      <div className="card">
        <h2>Create account</h2>
        <p className="muted">Register to start storing your digital assets.</p>
        {error ? <div className="error">{error}</div> : null}
        <div className="spacer" />
        <form className="grid" onSubmit={onSubmit}>
          <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input"
            placeholder="Password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn primary" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

