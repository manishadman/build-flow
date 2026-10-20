import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      login(response.data.user, response.data.user.token);

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
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
            <h1>Welcome back</h1>

            <p>Sign in to continue managing your projects.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account?</span>

            <Link to="/register">Create an account</Link>
          </div>
        </div>

        <p className="auth-copyright">
          BuildFlow · Full-stack project management
        </p>
      </div>
    </div>
  );
}
