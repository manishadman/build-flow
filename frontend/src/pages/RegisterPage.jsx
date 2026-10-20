import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api.js";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });

      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand auth-brand-animated">
          <div className="auth-brand-icon">
            <span>B</span>
          </div>

          <div className="auth-wordmark">
            <div className="auth-brand-name" aria-label="BuildFlow">
              <span style={{ "--i": 0 }}>B</span>
              <span style={{ "--i": 1 }}>u</span>
              <span style={{ "--i": 2 }}>i</span>
              <span style={{ "--i": 3 }}>l</span>
              <span style={{ "--i": 4 }}>d</span>
              <span style={{ "--i": 5 }}>F</span>
              <span style={{ "--i": 6 }}>l</span>
              <span style={{ "--i": 7 }}>o</span>
              <span style={{ "--i": 8 }}>w</span>
            </div>

            <div className="auth-flow-line">
              <div className="auth-flow-dot"></div>
            </div>

            <div className="auth-brand-subtitle">PROJECT MANAGEMENT</div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Create your account</h1>
            <p>Start organizing projects, tasks and teams with BuildFlow.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-name-grid">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>

                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  placeholder="First name"
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last name</label>

                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  placeholder="Last name"
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                value={password}
                placeholder="Create a password"
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>

        <p className="auth-copyright">
          BuildFlow · Full-stack project management
        </p>
      </div>
    </div>
  );
}
