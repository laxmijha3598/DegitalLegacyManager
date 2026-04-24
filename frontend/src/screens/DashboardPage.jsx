import React, { useEffect, useMemo, useState } from "react";
import { apiFetch, getApiOrigin } from "../lib/api.js";
import { fetchMe, getUser, setUser } from "../lib/auth.js";

function DeathPill({ status }) {
  const cls = status === "verified_deceased" ? "bad" : status === "pending_verification" ? "warn" : "ok";
  const label =
    status === "verified_deceased" ? "Verified Deceased" : status === "pending_verification" ? "Pending Verification" : "Alive";
  return <span className={`pill ${cls}`}>Death Status: {label}</span>;
}

export default function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const user = getUser();
  const apiOrigin = useMemo(() => getApiOrigin(), []);

  async function loadAll() {
    setError("");
    try {
      const [a, n, notif, me] = await Promise.all([
        apiFetch("/api/assets"),
        apiFetch("/api/nominees"),
        apiFetch("/api/notifications"),
        fetchMe()
      ]);
      setAssets(a.assets);
      setNominees(n.nominees);
      setNotifications(notif.notifications);
      setUser(me);
    } catch (err) {
      setError(err.message || "Failed to load");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createAsset(e) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const asset = {
      title: form.get("title"),
      type: form.get("type"),
      description: form.get("description") || "",
      visibility: form.get("visibility"),
      credential:
        form.get("type") === "credential"
          ? {
              username: form.get("c_username") || "",
              password: form.get("c_password") || "",
              url: form.get("c_url") || ""
            }
          : undefined
    };
    const payload = new FormData();
    payload.append("asset", JSON.stringify(asset));
    const file = form.get("file");
    if (file && file.name) payload.append("file", file);

    try {
      await apiFetch("/api/assets", { method: "POST", body: payload, isFormData: true });
      e.currentTarget.reset();
      await loadAll();
    } catch (err) {
      setError(err.message || "Create asset failed");
    }
  }

  async function deleteAsset(id) {
    setError("");
    try {
      await apiFetch(`/api/assets/${id}`, { method: "DELETE" });
      await loadAll();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  async function addNominee(e) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("n_name"),
      email: form.get("n_email"),
      relationship: form.get("n_relationship") || ""
    };
    try {
      await apiFetch("/api/nominees", { method: "POST", body });
      e.currentTarget.reset();
      await loadAll();
    } catch (err) {
      setError(err.message || "Add nominee failed");
    }
  }

  async function removeNominee(id) {
    setError("");
    try {
      await apiFetch(`/api/nominees/${id}`, { method: "DELETE" });
      await loadAll();
    } catch (err) {
      setError(err.message || "Remove nominee failed");
    }
  }

  async function requestDeathVerification() {
    setError("");
    try {
      await apiFetch("/api/death/request", { method: "POST" });
      await loadAll();
    } catch (err) {
      setError(err.message || "Request failed");
    }
  }

  return (
    <div className="row two">
      <div className="card">
        <div className="flex" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0 }}>Welcome, {user?.name || "User"}</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              Store your assets and assign nominees. Access is released after admin verification (simulation).
            </p>
          </div>
          <div className="flex">
            <DeathPill status={user?.deathStatus || "alive"} />
            <button className="btn" onClick={loadAll}>
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <>
            <div className="spacer" />
            <div className="error">{error}</div>
          </>
        ) : null}

        <div className="spacer" />
        <div className="card" style={{ padding: 14 }}>
          <div className="flex" style={{ justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 800 }}>Death verification simulation</div>
              <div className="muted" style={{ fontSize: 14 }}>
                For college demo: user can raise request; admin can verify/reject in Admin panel.
              </div>
            </div>
            <button className="btn danger" onClick={requestDeathVerification} disabled={user?.deathStatus !== "alive"}>
              Request Verification
            </button>
          </div>
        </div>

        <div className="spacer" />
        <h3>Add Asset</h3>
        <form className="grid" onSubmit={createAsset}>
          <div className="grid two">
            <input className="input" name="title" placeholder="Asset title" required />
            <select className="select" name="type" defaultValue="document">
              <option value="document">Document</option>
              <option value="credential">Credential</option>
              <option value="media">Media</option>
              <option value="note">Note</option>
            </select>
          </div>
          <textarea className="textarea" name="description" placeholder="Description (optional)" />
          <div className="grid two">
            <select className="select" name="visibility" defaultValue="nominee_on_verified_death">
              <option value="nominee_on_verified_death">Release to nominee after verification</option>
              <option value="private">Private</option>
            </select>
            <input className="input" type="file" name="file" />
          </div>
          <div className="grid two">
            <input className="input" name="c_username" placeholder="Credential username (if type=credential)" />
            <input className="input" name="c_password" placeholder="Credential password (if type=credential)" />
          </div>
          <input className="input" name="c_url" placeholder="Credential URL (optional)" />
          <button className="btn primary">Save Asset</button>
          <div className="muted" style={{ fontSize: 12 }}>
            Note: credential fields are stored in plaintext for demo; do not use real passwords.
          </div>
        </form>
      </div>

      <div className="grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>My Assets</h3>
          {assets.length === 0 ? (
            <div className="muted">No assets yet.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{a.title}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {a.visibility === "private" ? "Private" : "Released on verified death"}
                      </div>
                    </td>
                    <td>{a.type}</td>
                    <td>
                      {a.file?.path ? (
                        <a href={`${apiOrigin}${a.file.path}`} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <button className="btn danger" onClick={() => deleteAsset(a._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Nominees</h3>
          <form className="grid" onSubmit={addNominee}>
            <input className="input" name="n_name" placeholder="Nominee name" required />
            <input className="input" name="n_email" placeholder="Nominee email" required />
            <input className="input" name="n_relationship" placeholder="Relationship (optional)" />
            <button className="btn primary">Add Nominee</button>
          </form>
          <div className="spacer" />
          {nominees.length === 0 ? (
            <div className="muted">No nominees added.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Access Code</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {nominees.map((n) => (
                  <tr key={n._id}>
                    <td>{n.name}</td>
                    <td>{n.email}</td>
                    <td>
                      <span className="pill">{n.accessCode}</span>
                    </td>
                    <td>
                      <button className="btn danger" onClick={() => removeNominee(n._id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            For demo: share this Access Code with the nominee (instead of email OTP).
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Notifications (AI Reminders)</h3>
          {notifications.length === 0 ? (
            <div className="muted">No notifications.</div>
          ) : (
            <div className="grid">
              {notifications.slice(0, 10).map((n) => (
                <div key={n._id} className="card" style={{ padding: 12 }}>
                  <div className="flex" style={{ justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 800 }}>{n.title}</div>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 14 }}>
                    {n.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

