import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function OrganizationPage() {
  const { organizationId } = useParams();
  const { user } = useAuth();

  // =========================
  // ORGANIZATION DATA
  // =========================

  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [deletingOrganization, setDeletingOrganization] = useState(false);
  const [deleteOrganizationError, setDeleteOrganizationError] = useState("");

  // =========================
  // PAGE STATE
  // =========================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // EDIT ORGANIZATION STATE
  // =========================

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updatingOrganization, setUpdatingOrganization] = useState(false);
  const [updateOrganizationError, setUpdateOrganizationError] = useState("");

  // =========================
  // MEMBER MANAGEMENT STATE
  // =========================

  const [memberError, setMemberError] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // =========================
  // CREATE PROJECT STATE
  // =========================

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState("PLANNING");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState("");

  // =========================
  // CURRENT USER / PERMISSIONS
  // =========================

  // Login response may contain "id".
  // /users/me may contain "_id".
  // This allows either form to work.
  const currentUserId = user?._id || user?.id;

  const currentMembership = members.find(
    (membership) => membership.user?._id === currentUserId,
  );

  const currentRole = currentMembership?.role;

  const canManageOrganization =
    currentRole === "OWNER" || currentRole === "ADMIN";

  const canDeleteOrganization = currentRole === "OWNER";

  // Based on our backend permissions,
  // OWNER and ADMIN can create projects.
  const canCreateProject = currentRole === "OWNER" || currentRole === "ADMIN";

  // =========================
  // LOAD ORGANIZATION
  // =========================

  useEffect(() => {
    async function loadOrganization() {
      try {
        const [organizationResponse, membersResponse, projectsResponse] =
          await Promise.all([
            api.get(`/organizations/${organizationId}`),

            api.get(`/organizations/${organizationId}/members`),

            api.get(`/organizations/${organizationId}/projects`),
          ]);

        setOrganization(organizationResponse.data);

        setEditName(organizationResponse.data.name || "");
        setEditDescription(organizationResponse.data.description || "");

        setMembers(membersResponse.data);

        setProjects(projectsResponse.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load organization",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrganization();
  }, [organizationId]);

  // =========================
  // UPDATE MEMBER ROLE
  // =========================

  async function handleMemberRoleChange(membership, newRole) {
    setMemberError("");
    setUpdatingMemberId(membership._id);

    try {
      const response = await api.patch(
        `/organizations/${organizationId}/members/${membership.user._id}`,
        {
          role: newRole,
        },
      );

      setMembers((currentMembers) =>
        currentMembers.map((currentMembership) =>
          currentMembership._id === membership._id
            ? response.data
            : currentMembership,
        ),
      );
    } catch (error) {
      setMemberError(
        error.response?.data?.message || "Failed to update organization member",
      );
    } finally {
      setUpdatingMemberId(null);
    }
  }

  // =========================
  // REMOVE MEMBER
  // =========================

  async function handleRemoveMember(membership) {
    setMemberError("");

    const confirmed = window.confirm(
      `Remove ${membership.user.firstName} ${membership.user.lastName} from this organization?`,
    );

    if (!confirmed) {
      return;
    }

    setRemovingMemberId(membership._id);

    try {
      await api.delete(
        `/organizations/${organizationId}/members/${membership.user._id}`,
      );

      setMembers((currentMembers) =>
        currentMembers.filter(
          (currentMembership) => currentMembership._id !== membership._id,
        ),
      );
    } catch (error) {
      setMemberError(
        error.response?.data?.message || "Failed to remove organization member",
      );
    } finally {
      setRemovingMemberId(null);
    }
  }

  // =========================
  // CREATE PROJECT
  // =========================

  async function handleCreateProject(event) {
    event.preventDefault();

    setProjectError("");
    setCreatingProject(true);

    try {
      const response = await api.post(
        `/organizations/${organizationId}/projects`,
        {
          name: projectName,
          description: projectDescription,
          status: projectStatus,
          startDate: startDate || undefined,
          dueDate: dueDate || undefined,
        },
      );

      setProjects((currentProjects) => [...currentProjects, response.data]);

      setProjectName("");
      setProjectDescription("");
      setProjectStatus("PLANNING");
      setStartDate("");
      setDueDate("");
    } catch (error) {
      setProjectError(
        error.response?.data?.message || "Failed to create project",
      );
    } finally {
      setCreatingProject(false);
    }
  }
  // =========================
  // UPDATE ORGANIZATION
  // =========================

  async function handleUpdateOrganization(event) {
    event.preventDefault();

    setUpdateOrganizationError("");
    setUpdatingOrganization(true);

    try {
      const response = await api.patch(`/organizations/${organizationId}`, {
        name: editName,
        description: editDescription,
      });

      setOrganization(response.data);

      setEditName(response.data.name || "");
      setEditDescription(response.data.description || "");
    } catch (error) {
      setUpdateOrganizationError(
        error.response?.data?.message || "Failed to update organization",
      );
    } finally {
      setUpdatingOrganization(false);
    }
  }
  // =========================
  // DELETE ORGANIZATION
  // =========================

  async function handleDeleteOrganization() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${organization.name}"? This will permanently delete all of its projects, tasks, comments, tags, memberships, and activity.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteOrganizationError("");
    setDeletingOrganization(true);

    try {
      await api.delete(`/organizations/${organizationId}`);

      window.location.href = "/organizations";
    } catch (error) {
      setDeleteOrganizationError(
        error.response?.data?.message || "Failed to delete organization",
      );

      setDeletingOrganization(false);
    }
  }
  // =========================
  // PAGE STATES
  // =========================

  if (loading) {
    return <p>Loading organization...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!organization) {
    return <p>Organization not found.</p>;
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="page organization-page">
      {/* ORGANIZATION HEADER */}

      <div className="organization-detail-header">
        <div className="organization-title-area">
          <div className="organization-large-icon">
            {organization.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <div className="organization-title-row">
              <h1>{organization.name}</h1>

              {currentRole && (
                <span
                  className={`badge ${
                    currentRole === "OWNER"
                      ? "badge-primary"
                      : currentRole === "ADMIN"
                        ? "badge-info"
                        : "badge-neutral"
                  }`}
                >
                  {currentRole}
                </span>
              )}
            </div>

            <p className="page-subtitle">
              {organization.description || "No description"}
            </p>
          </div>
        </div>

        <Link to="/organizations" className="btn btn-secondary">
          ← Organizations
        </Link>
      </div>

      {/* SUMMARY */}

      <div className="organization-summary">
        <div className="organization-summary-item">
          <strong>{projects.length}</strong>
          <span>Projects</span>
        </div>

        <div className="organization-summary-item">
          <strong>{members.length}</strong>
          <span>Members</span>
        </div>

        <div className="organization-summary-item">
          <strong>{currentRole || "—"}</strong>
          <span>Your Role</span>
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="organization-detail-layout">
        <div className="organization-primary-column">
          {/* PROJECTS */}

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Projects</h2>

                <p className="section-description">
                  Projects belonging to this organization.
                </p>
              </div>

              <span className="badge badge-neutral">{projects.length}</span>
            </div>

            {projects.length === 0 ? (
              <div className="empty-state">
                <h3>No projects yet</h3>

                <p className="mb-0">
                  {canCreateProject
                    ? "Create your first project using the form."
                    : "This organization does not have any projects yet."}
                </p>
              </div>
            ) : (
              <div className="organization-project-grid">
                {projects.map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="organization-project-card"
                  >
                    <div className="organization-project-top">
                      <div className="project-icon">
                        {project.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <span
                        className={`badge ${
                          project.status === "ACTIVE"
                            ? "badge-success"
                            : project.status === "COMPLETED"
                              ? "badge-primary"
                              : project.status === "ON_HOLD"
                                ? "badge-warning"
                                : "badge-neutral"
                        }`}
                      >
                        {project.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <h3>{project.name}</h3>

                    <p>{project.description || "No description provided."}</p>

                    <div className="project-dates">
                      {project.startDate && (
                        <span>
                          Start{" "}
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      )}

                      {project.dueDate && (
                        <span>
                          Due {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      {!project.startDate && !project.dueDate && (
                        <span>No dates set</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* MEMBERS */}

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Members</h2>

                <p className="section-description">
                  People with access to this organization.
                </p>
              </div>

              <span className="badge badge-neutral">{members.length}</span>
            </div>

            {memberError && (
              <div className="alert alert-error">{memberError}</div>
            )}

            {members.length === 0 ? (
              <div className="empty-state">No members found.</div>
            ) : (
              <div className="member-list">
                {members.map((membership) => {
                  const isOwner = membership.role === "OWNER";

                  const isUpdating = updatingMemberId === membership._id;

                  const isRemoving = removingMemberId === membership._id;

                  const initials =
                    `${membership.user.firstName?.charAt(0) || ""}${
                      membership.user.lastName?.charAt(0) || ""
                    }`.toUpperCase();

                  return (
                    <div key={membership._id} className="member-row">
                      <div className="member-identity">
                        <div className="member-avatar">{initials}</div>

                        <div className="member-details">
                          <strong>
                            {membership.user.firstName}{" "}
                            {membership.user.lastName}
                          </strong>

                          <span>{membership.user.email}</span>
                        </div>
                      </div>

                      <div className="member-controls">
                        {canManageOrganization && !isOwner ? (
                          <>
                            <select
                              className="member-role-select"
                              value={membership.role}
                              disabled={isUpdating}
                              aria-label={`Role for ${membership.user.firstName} ${membership.user.lastName}`}
                              onChange={(event) =>
                                handleMemberRoleChange(
                                  membership,
                                  event.target.value,
                                )
                              }
                            >
                              <option value="MEMBER">Member</option>

                              <option value="ADMIN">Admin</option>
                            </select>

                            <button
                              type="button"
                              className="btn btn-ghost btn-sm member-remove-button"
                              disabled={isRemoving}
                              onClick={() => handleRemoveMember(membership)}
                            >
                              {isRemoving ? "Removing..." : "Remove"}
                            </button>
                          </>
                        ) : (
                          <span
                            className={`badge ${
                              membership.role === "OWNER"
                                ? "badge-primary"
                                : membership.role === "ADMIN"
                                  ? "badge-info"
                                  : "badge-neutral"
                            }`}
                          >
                            {membership.role}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}

        <aside className="organization-secondary-column">
          {/* EDIT ORGANIZATION */}

          {canManageOrganization && (
            <section className="card edit-organization-card">
              <div className="card-header">
                <div>
                  <h2>Edit Organization</h2>

                  <p className="section-description">
                    Update this workspace's name and description.
                  </p>
                </div>
              </div>

              {updateOrganizationError && (
                <div className="alert alert-error">
                  {updateOrganizationError}
                </div>
              )}

              <form onSubmit={handleUpdateOrganization}>
                <div className="form-group">
                  <label htmlFor="editOrganizationName">
                    Organization Name
                  </label>

                  <input
                    id="editOrganizationName"
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editOrganizationDescription">
                    Description
                  </label>

                  <textarea
                    id="editOrganizationDescription"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    placeholder="What is this organization for?"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingOrganization}
                >
                  {updatingOrganization ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>
          )}
          {/* CREATE PROJECT */}

          {canCreateProject && (
            <section className="card create-project-card">
              <div className="card-header">
                <div>
                  <h2>Create Project</h2>

                  <p className="section-description">
                    Add a project to this workspace.
                  </p>
                </div>
              </div>

              {projectError && (
                <div className="alert alert-error">{projectError}</div>
              )}

              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label htmlFor="projectName">Project Name</label>

                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    placeholder="Example: Website Redesign"
                    onChange={(event) => setProjectName(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectDescription">Description</label>

                  <textarea
                    id="projectDescription"
                    value={projectDescription}
                    placeholder="What is this project about?"
                    onChange={(event) =>
                      setProjectDescription(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectStatus">Status</label>

                  <select
                    id="projectStatus"
                    value={projectStatus}
                    onChange={(event) => setProjectStatus(event.target.value)}
                  >
                    <option value="PLANNING">Planning</option>

                    <option value="ACTIVE">Active</option>

                    <option value="ON_HOLD">On Hold</option>

                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="form-date-grid">
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>

                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dueDate">Due Date</label>

                    <input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary create-project-button"
                  disabled={creatingProject}
                >
                  {creatingProject ? "Creating..." : "Create Project"}
                </button>
              </form>
            </section>
          )}

          {/* WORKSPACE INFORMATION */}

          <section className="card workspace-info-card">
            <h3>Workspace Information</h3>

            <div className="workspace-info-row">
              <span>Projects</span>
              <strong>{projects.length}</strong>
            </div>

            <div className="workspace-info-row">
              <span>Members</span>
              <strong>{members.length}</strong>
            </div>

            <div className="workspace-info-row">
              <span>Your role</span>

              <strong>{currentRole || "—"}</strong>
            </div>
          </section>
        </aside>
      </div>

      {/* DANGER ZONE */}

      {canDeleteOrganization && (
        <section className="card danger-zone organization-danger-zone">
          <div className="danger-zone-content">
            <div>
              <h2>Delete Organization</h2>

              <p className="mb-0">
                Permanently delete this organization, its projects, tasks,
                comments, tags, memberships and activity. This action cannot be
                undone.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteOrganization}
              disabled={deletingOrganization}
            >
              {deletingOrganization ? "Deleting..." : "Delete Organization"}
            </button>
          </div>

          {deleteOrganizationError && (
            <div className="alert alert-error organization-delete-error">
              {deleteOrganizationError}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
