import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api.js";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get("/dashboard");

        setDashboard(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p className="mb-0">Loading dashboard...</p>
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

  if (!dashboard) {
    return (
      <div className="page">
        <div className="empty-state">Dashboard unavailable.</div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p className="page-subtitle">
            An overview of your projects and assigned work.
          </p>
        </div>
      </div>

      {/* STATISTICS */}

      <section className="dashboard-stats grid grid-4">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Projects</span>

            <span className="stat-icon stat-icon-primary">P</span>
          </div>

          <strong className="stat-value">{dashboard.stats.projectCount}</strong>

          <span className="stat-description">Active memberships</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Assigned Tasks</span>

            <span className="stat-icon stat-icon-info">T</span>
          </div>

          <strong className="stat-value">
            {dashboard.stats.assignedTaskCount}
          </strong>

          <span className="stat-description">Tasks assigned to you</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Overdue</span>

            <span className="stat-icon stat-icon-danger">!</span>
          </div>

          <strong className="stat-value">
            {dashboard.stats.overdueTaskCount}
          </strong>

          <span className="stat-description">Need your attention</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Completed</span>

            <span className="stat-icon stat-icon-success">✓</span>
          </div>

          <strong className="stat-value">
            {dashboard.stats.completedTaskCount}
          </strong>

          <span className="stat-description">Tasks completed</span>
        </div>
      </section>

      {/* MAIN DASHBOARD CONTENT */}

      <div className="dashboard-layout">
        {/* PROJECTS */}

        <section className="card dashboard-projects">
          <div className="card-header">
            <div>
              <h2>My Projects</h2>

              <p className="section-description">
                Projects you currently belong to.
              </p>
            </div>

            <Link to="/organizations" className="section-link">
              View organizations →
            </Link>
          </div>

          {dashboard.projects.length === 0 ? (
            <div className="empty-state">
              You do not belong to any projects yet.
            </div>
          ) : (
            <div className="dashboard-project-grid">
              {dashboard.projects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="project-card"
                >
                  <div className="project-card-top">
                    <div className="project-icon">
                      {project.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <span
                      className={`badge ${
                        project.status === "ACTIVE"
                          ? "badge-success"
                          : project.status === "COMPLETED"
                            ? "badge-primary"
                            : "badge-neutral"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <h3>{project.name}</h3>

                  <p>{project.description || "No description"}</p>

                  <div className="project-card-footer">
                    {project.dueDate ? (
                      <span>
                        Due {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>No due date</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ASSIGNED TASKS */}

        <section className="card">
          <div className="card-header">
            <div>
              <h2>My Tasks</h2>

              <p className="section-description">
                Work currently assigned to you.
              </p>
            </div>
          </div>

          {dashboard.assignedTasks.length === 0 ? (
            <div className="empty-state">You have no assigned tasks.</div>
          ) : (
            <div className="dashboard-task-list">
              {dashboard.assignedTasks.map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="dashboard-task"
                >
                  <div className="dashboard-task-main">
                    <strong>{task.title}</strong>

                    {task.project && (
                      <span className="dashboard-task-project">
                        {task.project.name}
                      </span>
                    )}
                  </div>

                  <div className="dashboard-task-meta">
                    <span
                      className={`badge ${
                        task.status === "DONE"
                          ? "badge-success"
                          : task.status === "IN_PROGRESS"
                            ? "badge-info"
                            : task.status === "REVIEW"
                              ? "badge-warning"
                              : "badge-neutral"
                      }`}
                    >
                      {task.status.replaceAll("_", " ")}
                    </span>

                    <span
                      className={`badge ${
                        task.priority === "URGENT"
                          ? "badge-danger"
                          : task.priority === "HIGH"
                            ? "badge-warning"
                            : "badge-neutral"
                      }`}
                    >
                      {task.priority}
                    </span>

                    {task.dueDate && (
                      <span className="task-date">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* OVERDUE */}

      <section className="card overdue-section">
        <div className="card-header">
          <div>
            <h2>Overdue Tasks</h2>

            <p className="section-description">
              Tasks that have passed their due date.
            </p>
          </div>

          {dashboard.overdueTasks.length > 0 && (
            <span className="badge badge-danger">
              {dashboard.overdueTasks.length} overdue
            </span>
          )}
        </div>

        {dashboard.overdueTasks.length === 0 ? (
          <div className="empty-state">
            No overdue tasks. You're all caught up.
          </div>
        ) : (
          <div className="dashboard-task-list">
            {dashboard.overdueTasks.map((task) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="dashboard-task overdue-task"
              >
                <div className="dashboard-task-main">
                  <strong>{task.title}</strong>

                  {task.project && (
                    <span className="dashboard-task-project">
                      {task.project.name}
                    </span>
                  )}
                </div>

                <div className="dashboard-task-meta">
                  <span className="badge badge-danger">Overdue</span>

                  <span
                    className={`badge ${
                      task.priority === "URGENT"
                        ? "badge-danger"
                        : task.priority === "HIGH"
                          ? "badge-warning"
                          : "badge-neutral"
                    }`}
                  >
                    {task.priority}
                  </span>

                  {task.dueDate && (
                    <span className="task-date overdue-date">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
