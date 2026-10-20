import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();

  // =========================
  // PROJECT DATA
  // =========================

  const [project, setProject] = useState(null);

  const [members, setMembers] = useState([]);

  const [organizationMembers, setOrganizationMembers] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [tags, setTags] = useState([]);

  const [deletingProject, setDeletingProject] = useState(false);

  const [deleteProjectError, setDeleteProjectError] = useState("");

  // =========================
  // PAGE STATE
  // =========================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // EDIT PROJECT STATE
  // =========================

  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [editProjectStatus, setEditProjectStatus] = useState("PLANNING");
  const [editProjectStartDate, setEditProjectStartDate] = useState("");
  const [editProjectDueDate, setEditProjectDueDate] = useState("");

  const [updatingProject, setUpdatingProject] = useState(false);
  const [updateProjectError, setUpdateProjectError] = useState("");

  // =========================
  // ADD MEMBER STATE
  // =========================

  const [selectedUserId, setSelectedUserId] = useState("");

  const [selectedRole, setSelectedRole] = useState("MEMBER");

  const [addingMember, setAddingMember] = useState(false);

  const [memberError, setMemberError] = useState("");

  const [updatingMemberId, setUpdatingMemberId] = useState(null);

  const [removingMemberId, setRemovingMemberId] = useState(null);

  // =========================
  // CREATE TASK STATE
  // =========================

  const [taskTitle, setTaskTitle] = useState("");

  const [taskDescription, setTaskDescription] = useState("");

  const [taskStatus, setTaskStatus] = useState("TODO");

  const [taskPriority, setTaskPriority] = useState("MEDIUM");

  const [taskDueDate, setTaskDueDate] = useState("");

  const [taskAssignee, setTaskAssignee] = useState("");

  const [creatingTask, setCreatingTask] = useState(false);

  const [taskError, setTaskError] = useState("");

  // =========================
  // TAG STATE
  // =========================

  const [tagName, setTagName] = useState("");

  const [creatingTag, setCreatingTag] = useState(false);

  const [tagError, setTagError] = useState("");

  const [editingTagId, setEditingTagId] = useState(null);

  const [editTagName, setEditTagName] = useState("");

  // =========================
  // SEARCH / FILTER / SORT
  // =========================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [priorityFilter, setPriorityFilter] = useState("");

  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [tagFilter, setTagFilter] = useState("");

  const [sort, setSort] = useState("");

  const [filtering, setFiltering] = useState(false);

  const [filterError, setFilterError] = useState("");

  // =========================
  // AVAILABLE PROJECT MEMBERS
  // =========================

  const projectMemberUserIds = members.map(
    (membership) => membership.user?._id,
  );

  const availableOrganizationMembers = organizationMembers.filter(
    (organizationMembership) =>
      !projectMemberUserIds.includes(organizationMembership.user?._id),
  );
  // =========================
  // PERMISSIONS
  // =========================

  const currentUserId = user?._id || user?.id;

  const currentMembership = members.find(
    (membership) => membership.user?._id === currentUserId,
  );

  const currentRole = currentMembership?.role;

  const canManageProject = currentRole === "OWNER" || currentRole === "ADMIN";
  // =========================
  // LOAD PROJECT
  // =========================

  useEffect(() => {
    async function loadProject() {
      try {
        const projectResponse = await api.get(`/projects/${projectId}`);

        const projectData = projectResponse.data;

        setProject(projectData);

        setEditProjectName(projectData.name || "");
        setEditProjectDescription(projectData.description || "");
        setEditProjectStatus(projectData.status || "PLANNING");

        setEditProjectStartDate(
          projectData.startDate ? projectData.startDate.slice(0, 10) : "",
        );

        setEditProjectDueDate(
          projectData.dueDate ? projectData.dueDate.slice(0, 10) : "",
        );
        const organizationId =
          projectData.organization?._id || projectData.organization;

        const membersResponse = await api.get(`/projects/${projectId}/members`);

        const tasksResponse = await api.get(`/projects/${projectId}/tasks`);

        const organizationMembersResponse = await api.get(
          `/organizations/${organizationId}/members`,
        );

        const tagsResponse = await api.get(`/projects/${projectId}/tags`);

        setMembers(membersResponse.data);

        setTasks(tasksResponse.data);

        setOrganizationMembers(organizationMembersResponse.data);

        setTags(tagsResponse.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  // =========================
  // ADD PROJECT MEMBER
  // =========================

  async function handleAddMember(event) {
    event.preventDefault();

    if (!selectedUserId) {
      setMemberError("Please select a user");
      return;
    }

    setMemberError("");
    setAddingMember(true);

    try {
      const response = await api.post(`/projects/${projectId}/members`, {
        userId: selectedUserId,
        role: selectedRole,
      });

      setMembers((currentMembers) => [...currentMembers, response.data]);

      setSelectedUserId("");
      setSelectedRole("MEMBER");
    } catch (error) {
      setMemberError(
        error.response?.data?.message || "Failed to add project member",
      );
    } finally {
      setAddingMember(false);
    }
  }

  // =========================
  // UPDATE PROJECT MEMBER
  // =========================

  async function handleMemberRoleChange(membership, newRole) {
    setMemberError("");
    setUpdatingMemberId(membership._id);

    try {
      const response = await api.patch(
        `/projects/${projectId}/members/${membership.user._id}`,
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
        error.response?.data?.message || "Failed to update project member",
      );
    } finally {
      setUpdatingMemberId(null);
    }
  }

  // =========================
  // REMOVE PROJECT MEMBER
  // =========================

  async function handleRemoveMember(membership) {
    setMemberError("");

    const confirmed = window.confirm(
      `Remove ${membership.user.firstName} ${membership.user.lastName} from this project?`,
    );

    if (!confirmed) {
      return;
    }

    setRemovingMemberId(membership._id);

    try {
      await api.delete(`/projects/${projectId}/members/${membership.user._id}`);

      setMembers((currentMembers) =>
        currentMembers.filter(
          (currentMembership) => currentMembership._id !== membership._id,
        ),
      );
    } catch (error) {
      setMemberError(
        error.response?.data?.message || "Failed to remove project member",
      );
    } finally {
      setRemovingMemberId(null);
    }
  }

  // =========================
  // CREATE TASK
  // =========================

  async function handleCreateTask(event) {
    event.preventDefault();

    setTaskError("");
    setCreatingTask(true);

    try {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        assignee: taskAssignee || undefined,
      });

      setTasks((currentTasks) => [...currentTasks, response.data]);

      setTaskTitle("");
      setTaskDescription("");
      setTaskStatus("TODO");
      setTaskPriority("MEDIUM");
      setTaskDueDate("");
      setTaskAssignee("");
    } catch (error) {
      setTaskError(error.response?.data?.message || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  }

  // =========================
  // CREATE TAG
  // =========================

  async function handleCreateTag(event) {
    event.preventDefault();

    setTagError("");
    setCreatingTag(true);

    try {
      const response = await api.post(`/projects/${projectId}/tags`, {
        name: tagName,
      });

      setTags((currentTags) => [...currentTags, response.data]);

      setTagName("");
    } catch (error) {
      setTagError(error.response?.data?.message || "Failed to create tag");
    } finally {
      setCreatingTag(false);
    }
  }

  function handleStartEditTag(tag) {
    setEditingTagId(tag._id);
    setEditTagName(tag.name);
    setTagError("");
  }

  function handleCancelEditTag() {
    setEditingTagId(null);
    setEditTagName("");
  }

  async function handleSaveTag(tagId) {
    setTagError("");

    try {
      const response = await api.patch(`/tags/${tagId}`, {
        name: editTagName,
      });

      setTags((currentTags) =>
        currentTags.map((tag) => (tag._id === tagId ? response.data : tag)),
      );

      setEditingTagId(null);
      setEditTagName("");
    } catch (error) {
      setTagError(error.response?.data?.message || "Failed to update tag");
    }
  }

  async function handleDeleteTag(tagId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tag?",
    );

    if (!confirmed) {
      return;
    }

    setTagError("");

    try {
      await api.delete(`/tags/${tagId}`);

      setTags((currentTags) => currentTags.filter((tag) => tag._id !== tagId));
    } catch (error) {
      setTagError(error.response?.data?.message || "Failed to delete tag");
    }
  }

  // =========================
  // FILTER TASKS
  // =========================

  async function loadFilteredTasks() {
    setFilterError("");
    setFiltering(true);

    try {
      const params = {};

      if (search) {
        params.search = search;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (priorityFilter) {
        params.priority = priorityFilter;
      }

      if (assigneeFilter) {
        params.assignee = assigneeFilter;
      }

      if (tagFilter) {
        params.tag = tagFilter;
      }

      if (sort) {
        params.sort = sort;
      }

      const response = await api.get(`/projects/${projectId}/tasks`, {
        params,
      });

      setTasks(response.data);
    } catch (error) {
      setFilterError(error.response?.data?.message || "Failed to filter tasks");
    } finally {
      setFiltering(false);
    }
  }

  async function handleApplyFilters(event) {
    event.preventDefault();
    await loadFilteredTasks();
  }

  async function handleClearFilters() {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setAssigneeFilter("");
    setTagFilter("");
    setSort("");

    setFilterError("");
    setFiltering(true);

    try {
      const response = await api.get(`/projects/${projectId}/tasks`);

      setTasks(response.data);
    } catch (error) {
      setFilterError(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setFiltering(false);
    }
  }
  // =========================
  // UPDATE PROJECT
  // =========================

  async function handleUpdateProject(event) {
    event.preventDefault();

    setUpdateProjectError("");
    setUpdatingProject(true);

    try {
      const response = await api.patch(`/projects/${projectId}`, {
        name: editProjectName,
        description: editProjectDescription,
        status: editProjectStatus,
        startDate: editProjectStartDate || null,
        dueDate: editProjectDueDate || null,
      });

      const updatedProject = response.data;

      setProject(updatedProject);

      setEditProjectName(updatedProject.name || "");
      setEditProjectDescription(updatedProject.description || "");
      setEditProjectStatus(updatedProject.status || "PLANNING");

      setEditProjectStartDate(
        updatedProject.startDate ? updatedProject.startDate.slice(0, 10) : "",
      );

      setEditProjectDueDate(
        updatedProject.dueDate ? updatedProject.dueDate.slice(0, 10) : "",
      );
    } catch (error) {
      setUpdateProjectError(
        error.response?.data?.message || "Failed to update project",
      );
    } finally {
      setUpdatingProject(false);
    }
  }
  // =========================
  // DELETE PROJECT
  // =========================

  async function handleDeleteProject() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This will permanently delete its tasks, comments, tags, memberships, and activity.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteProjectError("");
    setDeletingProject(true);

    try {
      await api.delete(`/projects/${projectId}`);

      const organizationId = project.organization?._id || project.organization;

      window.location.href = `/organizations/${organizationId}`;
    } catch (error) {
      setDeleteProjectError(
        error.response?.data?.message || "Failed to delete project",
      );

      setDeletingProject(false);
    }
  }

  // =========================
  // PAGE STATES
  // =========================

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <div className="page project-page">
      {/* PROJECT HEADER */}

      <div className="project-detail-header">
        <div>
          <div className="project-title-row">
            <h1>{project.name}</h1>

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

            {currentRole && (
              <span className="badge badge-info">{currentRole}</span>
            )}
          </div>

          <p className="page-subtitle">
            {project.description || "No description"}
          </p>
        </div>

        <Link
          to={`/organizations/${
            project.organization?._id || project.organization
          }`}
          className="btn btn-secondary"
        >
          ← Organization
        </Link>
      </div>

      {/* PROJECT SUMMARY */}

      <div className="project-summary">
        <div className="project-summary-item">
          <strong>{tasks.length}</strong>
          <span>Tasks</span>
        </div>

        <div className="project-summary-item">
          <strong>{members.length}</strong>
          <span>Members</span>
        </div>

        <div className="project-summary-item">
          <strong>{tags.length}</strong>
          <span>Tags</span>
        </div>

        <div className="project-summary-item">
          <strong>
            {project.dueDate
              ? new Date(project.dueDate).toLocaleDateString()
              : "—"}
          </strong>
          <span>Due Date</span>
        </div>
      </div>

      {/* MAIN PROJECT WORKSPACE */}

      <div className="project-workspace">
        {/* LEFT / MAIN COLUMN */}

        <div className="project-main-column">
          {/* TASKS */}

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Tasks</h2>
                <p className="section-description">
                  Track and manage work for this project.
                </p>
              </div>

              <span className="badge badge-neutral">{tasks.length}</span>
            </div>

            {/* FILTERS */}

            <form className="task-filter-panel" onSubmit={handleApplyFilters}>
              <div className="task-search-field">
                <label htmlFor="taskSearch">Search</label>

                <input
                  id="taskSearch"
                  type="text"
                  value={search}
                  placeholder="Search task titles..."
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="statusFilter">Status</label>

                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label htmlFor="priorityFilter">Priority</label>

                <select
                  id="priorityFilter"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  <option value="">All priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="assigneeFilter">Assignee</label>

                <select
                  id="assigneeFilter"
                  value={assigneeFilter}
                  onChange={(event) => setAssigneeFilter(event.target.value)}
                >
                  <option value="">All assignees</option>

                  {members.map((membership) => (
                    <option
                      key={membership.user._id}
                      value={membership.user._id}
                    >
                      {membership.user.firstName} {membership.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tagFilter">Tag</label>

                <select
                  id="tagFilter"
                  value={tagFilter}
                  onChange={(event) => setTagFilter(event.target.value)}
                >
                  <option value="">All tags</option>

                  {tags.map((tag) => (
                    <option key={tag._id} value={tag._id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="taskSort">Sort</label>

                <select
                  id="taskSort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="">Default</option>
                  <option value="dueDate">Due: earliest</option>
                  <option value="-dueDate">Due: latest</option>
                  <option value="createdAt">Created: oldest</option>
                  <option value="-createdAt">Created: newest</option>
                </select>
              </div>

              <div className="filter-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={filtering}
                >
                  {filtering ? "Loading..." : "Apply"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClearFilters}
                  disabled={filtering}
                >
                  Clear
                </button>
              </div>
            </form>

            {filterError && (
              <div className="alert alert-error">{filterError}</div>
            )}

            {/* TASK LIST */}

            {tasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks found</h3>
                <p className="mb-0">No tasks match your current filters.</p>
              </div>
            ) : (
              <div className="project-task-list">
                {tasks.map((task) => (
                  <Link
                    key={task._id}
                    to={`/tasks/${task._id}`}
                    className="project-task-row"
                  >
                    <div className="project-task-content">
                      <strong>{task.title}</strong>

                      <span>{task.description || "No description"}</span>
                    </div>

                    <div className="project-task-assignee">
                      {task.assignee && typeof task.assignee === "object"
                        ? `${task.assignee.firstName} ${task.assignee.lastName}`
                        : "Unassigned"}
                    </div>

                    <div className="project-task-meta">
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

                      <span className="project-task-date">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* CREATE TASK */}

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Create Task</h2>
                <p className="section-description">
                  Add new work to this project.
                </p>
              </div>
            </div>

            {taskError && <div className="alert alert-error">{taskError}</div>}

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="taskTitle">Title</label>

                <input
                  id="taskTitle"
                  type="text"
                  value={taskTitle}
                  placeholder="What needs to be done?"
                  onChange={(event) => setTaskTitle(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="taskDescription">Description</label>

                <textarea
                  id="taskDescription"
                  value={taskDescription}
                  placeholder="Add task details..."
                  onChange={(event) => setTaskDescription(event.target.value)}
                />
              </div>

              <div className="task-create-grid">
                <div className="form-group">
                  <label htmlFor="taskStatus">Status</label>

                  <select
                    id="taskStatus"
                    value={taskStatus}
                    onChange={(event) => setTaskStatus(event.target.value)}
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="taskPriority">Priority</label>

                  <select
                    id="taskPriority"
                    value={taskPriority}
                    onChange={(event) => setTaskPriority(event.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="taskAssignee">Assignee</label>

                  <select
                    id="taskAssignee"
                    value={taskAssignee}
                    onChange={(event) => setTaskAssignee(event.target.value)}
                  >
                    <option value="">Unassigned</option>

                    {members.map((membership) => (
                      <option
                        key={membership.user._id}
                        value={membership.user._id}
                      >
                        {membership.user.firstName} {membership.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="taskDueDate">Due Date</label>

                  <input
                    id="taskDueDate"
                    type="date"
                    value={taskDueDate}
                    onChange={(event) => setTaskDueDate(event.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={creatingTask}
              >
                {creatingTask ? "Creating..." : "Create Task"}
              </button>
            </form>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}

        <aside className="project-side-column">
          {/* EDIT PROJECT */}

          {canManageProject && (
            <section className="card edit-project-card">
              <div className="card-header">
                <div>
                  <h2>Edit Project</h2>

                  <p className="section-description">
                    Update this project's details and schedule.
                  </p>
                </div>
              </div>

              {updateProjectError && (
                <div className="alert alert-error">{updateProjectError}</div>
              )}

              <form onSubmit={handleUpdateProject}>
                <div className="form-group">
                  <label htmlFor="editProjectName">Project Name</label>

                  <input
                    id="editProjectName"
                    type="text"
                    value={editProjectName}
                    onChange={(event) => setEditProjectName(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editProjectDescription">Description</label>

                  <textarea
                    id="editProjectDescription"
                    value={editProjectDescription}
                    onChange={(event) =>
                      setEditProjectDescription(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editProjectStatus">Status</label>

                  <select
                    id="editProjectStatus"
                    value={editProjectStatus}
                    onChange={(event) =>
                      setEditProjectStatus(event.target.value)
                    }
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="editProjectStartDate">Start Date</label>

                  <input
                    id="editProjectStartDate"
                    type="date"
                    value={editProjectStartDate}
                    onChange={(event) =>
                      setEditProjectStartDate(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editProjectDueDate">Due Date</label>

                  <input
                    id="editProjectDueDate"
                    type="date"
                    value={editProjectDueDate}
                    onChange={(event) =>
                      setEditProjectDueDate(event.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingProject}
                >
                  {updatingProject ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>
          )}
          {/* MEMBERS */}

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Members</h2>
                <p className="section-description">Project access.</p>
              </div>

              <span className="badge badge-neutral">{members.length}</span>
            </div>

            {memberError && (
              <div className="alert alert-error">{memberError}</div>
            )}

            <div className="project-member-list">
              {members.map((membership) => {
                const isOwner = membership.role === "OWNER";

                const isUpdating = updatingMemberId === membership._id;

                const isRemoving = removingMemberId === membership._id;

                const initials = `${membership.user.firstName?.[0] || ""}${
                  membership.user.lastName?.[0] || ""
                }`.toUpperCase();

                return (
                  <div key={membership._id} className="project-member-row">
                    <div className="member-identity">
                      <div className="member-avatar">{initials}</div>

                      <div className="member-details">
                        <strong>
                          {membership.user.firstName} {membership.user.lastName}
                        </strong>

                        <span>{membership.user.email}</span>
                      </div>
                    </div>

                    {canManageProject && !isOwner ? (
                      <div className="project-member-actions">
                        <select
                          value={membership.role}
                          disabled={isUpdating}
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
                          className="member-remove-link"
                          disabled={isRemoving}
                          onClick={() => handleRemoveMember(membership)}
                        >
                          {isRemoving ? "Removing..." : "Remove"}
                        </button>
                      </div>
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
                );
              })}
            </div>

            {/* ADD MEMBER */}

            {canManageProject && (
              <div className="project-add-member">
                <h3>Add Member</h3>

                {availableOrganizationMembers.length === 0 ? (
                  <p className="mb-0">
                    All organization members are already in this project.
                  </p>
                ) : (
                  <form onSubmit={handleAddMember}>
                    <div className="form-group">
                      <label htmlFor="projectMember">User</label>

                      <select
                        id="projectMember"
                        value={selectedUserId}
                        onChange={(event) =>
                          setSelectedUserId(event.target.value)
                        }
                        required
                      >
                        <option value="">Select a user</option>

                        {availableOrganizationMembers.map((membership) => (
                          <option
                            key={membership.user._id}
                            value={membership.user._id}
                          >
                            {membership.user.firstName}{" "}
                            {membership.user.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="projectMemberRole">Role</label>

                      <select
                        id="projectMemberRole"
                        value={selectedRole}
                        onChange={(event) =>
                          setSelectedRole(event.target.value)
                        }
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-secondary"
                      disabled={addingMember}
                    >
                      {addingMember ? "Adding..." : "Add Member"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </section>

          {/* TAGS */}

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Tags</h2>
                <p className="section-description">Organize project tasks.</p>
              </div>
            </div>

            {tagError && <div className="alert alert-error">{tagError}</div>}

            {tags.length === 0 ? (
              <div className="empty-state">No tags yet.</div>
            ) : (
              <div className="project-tags">
                {tags.map((tag) => {
                  const isEditing = editingTagId === tag._id;

                  return (
                    <div key={tag._id} className="project-tag-row">
                      {!isEditing ? (
                        <>
                          <span className="badge badge-primary">
                            {tag.name}
                          </span>

                          {canManageProject && (
                            <div className="tag-actions">
                              <button
                                type="button"
                                onClick={() => handleStartEditTag(tag)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="tag-delete"
                                onClick={() => handleDeleteTag(tag._id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={editTagName}
                            onChange={(event) =>
                              setEditTagName(event.target.value)
                            }
                          />

                          <div className="tag-actions">
                            <button
                              type="button"
                              onClick={() => handleSaveTag(tag._id)}
                            >
                              Save
                            </button>

                            <button type="button" onClick={handleCancelEditTag}>
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {canManageProject && (
              <form className="create-tag-form" onSubmit={handleCreateTag}>
                <label htmlFor="tagName">Create Tag</label>

                <div className="create-tag-row">
                  <input
                    id="tagName"
                    type="text"
                    value={tagName}
                    placeholder="Tag name"
                    onChange={(event) => setTagName(event.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={creatingTag}
                  >
                    {creatingTag ? "..." : "Add"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* PROJECT DETAILS */}

          <section className="card project-info-card">
            <h3>Project Details</h3>

            <div className="workspace-info-row">
              <span>Status</span>
              <strong>{project.status.replaceAll("_", " ")}</strong>
            </div>

            <div className="workspace-info-row">
              <span>Your role</span>
              <strong>{currentRole || "—"}</strong>
            </div>

            <div className="workspace-info-row">
              <span>Start</span>
              <strong>
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString()
                  : "—"}
              </strong>
            </div>

            <div className="workspace-info-row">
              <span>Due</span>
              <strong>
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString()
                  : "—"}
              </strong>
            </div>
          </section>
        </aside>
      </div>

      {/* DELETE PROJECT */}

      {canManageProject && (
        <section className="card danger-zone project-danger-zone">
          <div className="danger-zone-content">
            <div>
              <h2>Delete Project</h2>

              <p className="mb-0">
                Permanently delete this project and its tasks, comments, tags,
                memberships and activity. This action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteProject}
              disabled={deletingProject}
            >
              {deletingProject ? "Deleting..." : "Delete Project"}
            </button>
          </div>

          {deleteProjectError && (
            <div className="alert alert-error project-delete-error">
              {deleteProjectError}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
