import React, { useState } from "react";
import { apiFetch, getApiOrigin } from "../lib/api.js";

export default function NomineeAccessPage() {
  const [ownerEmail, setOwnerEmail] = useState("");
  const [nomineeEmail, setNomineeEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiOrigin = getApiOrigin();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/nominees/access", {
        method: "POST",
        body: { ownerEmail, nomineeEmail, accessCode }
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Access failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row two">
      <div className="card">
        <h2>Nominee Access</h2>
        <p className="muted">
          For demo: enter owner email + nominee email + Access Code shared by owner. Access is available only after admin
          verifies death status (simulation).
        </p>
        {error ? <div className="error">{error}</div> : null}
        <div className="spacer" />
        <form className="grid" onSubmit={onSubmit}>
          <input className="input" placeholder="Owner email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
          <input
            className="input"
            placeholder="Nominee email"
            value={nomineeEmail}
            onChange={(e) => setNomineeEmail(e.target.value)}
          />
          <input
            className="input"
            placeholder="Access code (e.g. A1B2C3)"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
          />
          <button className="btn primary" disabled={loading}>
            {loading ? "Checking..." : "Access Assets"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Released Assets</h3>
        {!result ? (
          <div className="muted">No data yet.</div>
        ) : (
          <>
            <div className="muted" style={{ marginBottom: 10 }}>
              Owner: <b>{result.owner.name}</b> ({result.owner.email}) — Nominee: <b>{result.nominee.name}</b>
            </div>
            {result.assets.length === 0 ? (
              <div className="muted">No released assets.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>File</th>
                    <th>Credential</th>
                  </tr>
                </thead>
                <tbody>
                  {result.assets.map((a) => (
                    <tr key={a._id}>
                      <td>{a.title}</td>
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
                        {a.type === "credential" ? (
                          <span className="muted" style={{ fontSize: 12 }}>
                            {a.credential?.username ? `User: ${a.credential.username}` : ""}{" "}
                            {a.credential?.password ? `Pass: ${a.credential.password}` : ""}{" "}
                            {a.credential?.url ? `URL: ${a.credential.url}` : ""}
                          </span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

