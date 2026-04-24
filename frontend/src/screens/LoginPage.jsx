import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../lib/auth.js";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/app");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row">
      <div className="card">
        <h2>Login</h2>
        <p className="muted">Sign in to manage your digital legacy assets.</p>
        {error ? <div className="error">{error}</div> : null}
        <div className="spacer" />
        <form className="grid" onSubmit={onSubmit}>
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn primary" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="muted">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

