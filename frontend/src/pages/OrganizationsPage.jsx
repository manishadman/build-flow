import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api.js";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const response = await api.get("/organizations");

        setOrganizations(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load organizations",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrganizations();
  }, []);

  async function handleCreateOrganization(event) {
    event.preventDefault();

    setCreateError("");
    setCreating(true);

    try {
      const response = await api.post("/organizations", {
        name,
        description,
      });

      setOrganizations((currentOrganizations) => [
        ...currentOrganizations,
        response.data,
      ]);

      setName("");
      setDescription("");
    } catch (error) {
      setCreateError(
        error.response?.data?.message || "Failed to create organization",
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p className="mb-0">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page organizations-page">
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>Organizations</h1>

          <p className="page-subtitle">Manage your workspaces and projects.</p>
        </div>

        <span className="organization-count">
          {organizations.length}{" "}
          {organizations.length === 1 ? "organization" : "organizations"}
        </span>
      </div>

      <div className="organizations-layout">
        {/* ORGANIZATION LIST */}

        <section className="organizations-main">
          <div className="section-heading">
            <div>
              <h2>Your Organizations</h2>

              <p>Select an organization to view its projects and members.</p>
            </div>
          </div>

          {organizations.length === 0 ? (
            <div className="empty-state">
              <h3>No organizations yet</h3>

              <p className="mb-0">
                Create your first organization to start managing projects.
              </p>
            </div>
          ) : (
            <div className="organization-grid">
              {organizations.map((organization) => (
                <Link
                  key={organization._id}
                  to={`/organizations/${organization._id}`}
                  className="organization-card"
                >
                  <div className="organization-card-header">
                    <div className="organization-icon">
                      {organization.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <span className="organization-arrow">→</span>
                  </div>

                  <h3>{organization.name}</h3>

                  <p>
                    {organization.description || "No description provided."}
                  </p>

                  <div className="organization-card-footer">Open workspace</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CREATE ORGANIZATION */}

        <aside className="card create-organization-card">
          <div className="card-header">
            <div>
              <h2>Create Organization</h2>

              <p className="section-description">Start a new workspace.</p>
            </div>
          </div>

          {createError && (
            <div className="alert alert-error">{createError}</div>
          )}

          <form onSubmit={handleCreateOrganization}>
            <div className="form-group">
              <label htmlFor="organizationName">Organization Name</label>

              <input
                id="organizationName"
                type="text"
                value={name}
                placeholder="Example: Acme Engineering"
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="organizationDescription">Description</label>

              <textarea
                id="organizationDescription"
                value={description}
                placeholder="What does this organization work on?"
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <button
              className="btn btn-primary create-organization-button"
              type="submit"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Organization"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
