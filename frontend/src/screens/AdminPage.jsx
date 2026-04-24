import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";

export default function AdminPage() {
  const [counts, setCounts] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const [d, r] = await Promise.all([apiFetch("/api/admin/dashboard"), apiFetch("/api/admin/death-requests")]);
      setCounts(d.counts);
      setRequests(r.requests);
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(userId) {
    setError("");
    try {
      await apiFetch(`/api/admin/verify-death/${userId}`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message || "Verify failed");
    }
  }

  async function reject(userId) {
    setError("");
    try {
      await apiFetch(`/api/admin/reject-death/${userId}`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message || "Reject failed");
    }
  }

  return (
    <div className="row">
      <div className="card">
        <div className="flex" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              Role-based access for death verification simulation and system overview.
            </p>
          </div>
          <button className="btn" onClick={load}>
            Refresh
          </button>
        </div>

        {error ? (
          <>
            <div className="spacer" />
            <div className="error">{error}</div>
          </>
        ) : null}

        <div className="spacer" />
        <div className="row two">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Counts</h3>
            {!counts ? (
              <div className="muted">Loading...</div>
            ) : (
              <div className="grid two">
                <div className="pill">Users: {counts.users}</div>
                <div className="pill">Assets: {counts.assets}</div>
                <div className="pill warn">Pending: {counts.pendingVerifications}</div>
                <div className="pill bad">Verified Deceased: {counts.verifiedDeceased}</div>
              </div>
            )}
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Death Verification Requests</h3>
            {requests.length === 0 ? (
              <div className="muted">No requests.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {u.email}
                        </div>
                      </td>
                      <td>{u.deathStatus}</td>
                      <td className="muted" style={{ fontSize: 12 }}>
                        {new Date(u.updatedAt).toLocaleString()}
                      </td>
                      <td>
                        <div className="flex">
                          <button className="btn primary" onClick={() => verify(u._id)} disabled={u.deathStatus === "verified_deceased"}>
                            Verify
                          </button>
                          <button className="btn danger" onClick={() => reject(u._id)} disabled={u.deathStatus === "alive"}>
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

