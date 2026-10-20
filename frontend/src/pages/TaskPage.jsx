import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function TaskPage() {
  const { taskId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  // =========================
  // TASK DATA
  // =========================

  const [task, setTask] = useState(null);

  const [projectMembers, setProjectMembers] = useState([]);

  const [projectTags, setProjectTags] = useState([]);

  // =========================
  // PAGE STATE
  // =========================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // EDIT TASK STATE
  // =========================

  const [editTitle, setEditTitle] = useState("");

  const [editDescription, setEditDescription] = useState("");

  const [editStatus, setEditStatus] = useState("TODO");

  const [editPriority, setEditPriority] = useState("MEDIUM");

  const [editDueDate, setEditDueDate] = useState("");

  const [editAssignee, setEditAssignee] = useState("");

  const [selectedTagIds, setSelectedTagIds] = useState([]);

  const [updating, setUpdating] = useState(false);

  const [updateError, setUpdateError] = useState("");

  // =========================
  // COMMENT STATE
  // =========================

  const [comments, setComments] = useState([]);

  const [commentContent, setCommentContent] = useState("");

  const [addingComment, setAddingComment] = useState(false);

  const [commentError, setCommentError] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);

  const [editCommentContent, setEditCommentContent] = useState("");

  const [editingComment, setEditingComment] = useState(false);

  // =========================
  // DELETE TASK STATE
  // =========================

  const [deleting, setDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  // =========================
  // PERMISSIONS
  // =========================

  const currentUserId = user?._id || user?.id;

  const currentMembership = projectMembers.find(
    (membership) => membership.user?._id === currentUserId,
  );

  const currentRole = currentMembership?.role;

  const canDeleteTask = currentRole === "OWNER" || currentRole === "ADMIN";
  // =========================
  // LOAD TASK
  // =========================

  useEffect(() => {
    async function loadTask() {
      try {
        // TASK

        const taskResponse = await api.get(`/tasks/${taskId}`);

        const taskData = taskResponse.data;

        setTask(taskData);

        // COMMENTS

        const commentsResponse = await api.get(`/tasks/${taskId}/comments`);

        setComments(commentsResponse.data);

        // INITIALIZE EDIT FORM

        setEditTitle(taskData.title || "");

        setEditDescription(taskData.description || "");

        setEditStatus(taskData.status || "TODO");

        setEditPriority(taskData.priority || "MEDIUM");

        setEditDueDate(taskData.dueDate ? taskData.dueDate.slice(0, 10) : "");

        const assigneeId = taskData.assignee?._id || taskData.assignee || "";

        setEditAssignee(assigneeId);

        const currentTagIds = (taskData.tags || []).map(
          (tag) => tag._id || tag,
        );

        setSelectedTagIds(currentTagIds);

        // PROJECT ID

        const projectId = taskData.project?._id || taskData.project;

        // PROJECT MEMBERS

        const membersResponse = await api.get(`/projects/${projectId}/members`);

        setProjectMembers(membersResponse.data);

        // PROJECT TAGS

        const tagsResponse = await api.get(`/projects/${projectId}/tags`);

        setProjectTags(tagsResponse.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load task");
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [taskId]);

  // =========================
  // TAG CHECKBOX
  // =========================

  function handleTagChange(tagId, checked) {
    if (checked) {
      setSelectedTagIds((currentTagIds) => [...currentTagIds, tagId]);
    } else {
      setSelectedTagIds((currentTagIds) =>
        currentTagIds.filter((id) => id !== tagId),
      );
    }
  }

  // =========================
  // UPDATE TASK
  // =========================

  async function handleUpdateTask(event) {
    event.preventDefault();

    setUpdateError("");
    setUpdating(true);

    try {
      const response = await api.patch(`/tasks/${taskId}`, {
        title: editTitle,

        description: editDescription,

        status: editStatus,

        priority: editPriority,

        dueDate: editDueDate || null,

        assignee: editAssignee || null,

        tags: selectedTagIds,
      });

      setTask(response.data);
    } catch (error) {
      setUpdateError(error.response?.data?.message || "Failed to update task");
    } finally {
      setUpdating(false);
    }
  }

  // =========================
  // ADD COMMENT
  // =========================

  async function handleAddComment(event) {
    event.preventDefault();

    setCommentError("");
    setAddingComment(true);

    try {
      const response = await api.post(`/tasks/${taskId}/comments`, {
        content: commentContent,
      });

      setComments((currentComments) => [...currentComments, response.data]);

      setCommentContent("");
    } catch (error) {
      setCommentError(error.response?.data?.message || "Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  }

  // =========================
  // EDIT COMMENT
  // =========================

  function handleStartEditComment(comment) {
    setEditingCommentId(comment._id);

    setEditCommentContent(comment.content);

    setCommentError("");
  }

  function handleCancelEditComment() {
    setEditingCommentId(null);
    setEditCommentContent("");
  }

  async function handleSaveComment(commentId) {
    setCommentError("");
    setEditingComment(true);

    try {
      const response = await api.patch(`/comments/${commentId}`, {
        content: editCommentContent,
      });

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment._id === commentId ? response.data : comment,
        ),
      );

      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (error) {
      setCommentError(
        error.response?.data?.message || "Failed to update comment",
      );
    } finally {
      setEditingComment(false);
    }
  }

  // =========================
  // DELETE COMMENT
  // =========================

  async function handleDeleteComment(commentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) {
      return;
    }

    setCommentError("");

    try {
      await api.delete(`/comments/${commentId}`);

      setComments((currentComments) =>
        currentComments.filter((comment) => comment._id !== commentId),
      );
    } catch (error) {
      setCommentError(
        error.response?.data?.message || "Failed to delete comment",
      );
    }
  }

  // =========================
  // DELETE TASK
  // =========================

  async function handleDeleteTask() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setDeleting(true);

    try {
      await api.delete(`/tasks/${taskId}`);

      const projectId = task.project?._id || task.project;

      navigate(`/projects/${projectId}`);
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete task");

      setDeleting(false);
    }
  }

  // =========================
  // PAGE STATES
  // =========================

  if (loading) {
    return <p>Loading task...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!task) {
    return <p>Task not found.</p>;
  }

  const projectId = task.project?._id || task.project;

  return (
    <div className="page task-page">
      {/* HEADER */}

      <div className="task-detail-header">
        <div>
          <Link to={`/projects/${projectId}`} className="task-back-link">
            ← Back to Project
          </Link>

          <div className="task-title-row">
            <h1>{task.title}</h1>

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
          </div>

          <p className="page-subtitle">
            {task.description || "No description"}
          </p>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="task-summary">
        <div className="task-summary-item">
          <span>Status</span>
          <strong>{task.status.replaceAll("_", " ")}</strong>
        </div>

        <div className="task-summary-item">
          <span>Priority</span>
          <strong>{task.priority}</strong>
        </div>

        <div className="task-summary-item">
          <span>Assignee</span>

          <strong>
            {task.assignee && typeof task.assignee === "object"
              ? `${task.assignee.firstName} ${task.assignee.lastName}`
              : "Unassigned"}
          </strong>
        </div>

        <div className="task-summary-item">
          <span>Due Date</span>

          <strong>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
          </strong>
        </div>
      </div>

      {/* TAGS */}

      <section className="task-current-tags">
        <span className="task-tags-label">Tags</span>

        <div className="task-tag-list">
          {selectedTagIds.length === 0 ? (
            <span className="text-muted">No tags</span>
          ) : (
            projectTags
              .filter((tag) => selectedTagIds.includes(tag._id))
              .map((tag) => (
                <span key={tag._id} className="badge badge-primary">
                  {tag.name}
                </span>
              ))
          )}
        </div>
      </section>

      {/* MAIN LAYOUT */}

      <div className="task-detail-layout">
        {/* EDIT TASK */}

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Edit Task</h2>

              <p className="section-description">
                Update task details, assignment and status.
              </p>
            </div>
          </div>

          {updateError && (
            <div className="alert alert-error">{updateError}</div>
          )}

          <form onSubmit={handleUpdateTask}>
            <div className="form-group">
              <label htmlFor="editTitle">Title</label>

              <input
                id="editTitle"
                type="text"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="editDescription">Description</label>

              <textarea
                id="editDescription"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />
            </div>

            <div className="task-edit-grid">
              <div className="form-group">
                <label htmlFor="editStatus">Status</label>

                <select
                  id="editStatus"
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.target.value)}
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="editPriority">Priority</label>

                <select
                  id="editPriority"
                  value={editPriority}
                  onChange={(event) => setEditPriority(event.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="editDueDate">Due Date</label>

                <input
                  id="editDueDate"
                  type="date"
                  value={editDueDate}
                  onChange={(event) => setEditDueDate(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="editAssignee">Assignee</label>

                <select
                  id="editAssignee"
                  value={editAssignee}
                  onChange={(event) => setEditAssignee(event.target.value)}
                >
                  <option value="">Unassigned</option>

                  {projectMembers.map((membership) => (
                    <option
                      key={membership.user._id}
                      value={membership.user._id}
                    >
                      {membership.user.firstName} {membership.user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TAG SELECTION */}

            <fieldset className="task-tag-fieldset">
              <legend>Tags</legend>

              {projectTags.length === 0 ? (
                <p className="text-muted mb-0">No tags available.</p>
              ) : (
                <div className="task-tag-options">
                  {projectTags.map((tag) => (
                    <label
                      key={tag._id}
                      className={`task-tag-option ${
                        selectedTagIds.includes(tag._id) ? "selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag._id)}
                        onChange={(event) =>
                          handleTagChange(tag._id, event.target.checked)
                        }
                      />

                      <span>{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <div className="task-save-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* TASK INFORMATION */}

        <aside className="task-side-column">
          <section className="card task-information-card">
            <h3>Task Information</h3>

            <div className="workspace-info-row">
              <span>Status</span>

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
            </div>

            <div className="workspace-info-row">
              <span>Priority</span>

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
            </div>

            <div className="workspace-info-row">
              <span>Assignee</span>

              <strong>
                {task.assignee && typeof task.assignee === "object"
                  ? `${task.assignee.firstName} ${task.assignee.lastName}`
                  : "Unassigned"}
              </strong>
            </div>

            <div className="workspace-info-row">
              <span>Due</span>

              <strong>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "—"}
              </strong>
            </div>

            <div className="workspace-info-row">
              <span>Your project role</span>

              <strong>{currentRole || "—"}</strong>
            </div>
          </section>
        </aside>
      </div>

      {/* COMMENTS */}

      <section className="card task-comments-section">
        <div className="card-header">
          <div>
            <h2>Comments</h2>

            <p className="section-description">
              Discussion and updates for this task.
            </p>
          </div>

          <span className="badge badge-neutral">{comments.length}</span>
        </div>

        {commentError && (
          <div className="alert alert-error">{commentError}</div>
        )}

        {comments.length === 0 ? (
          <div className="empty-state">
            No comments yet. Start the discussion below.
          </div>
        ) : (
          <div className="comment-list">
            {comments.map((comment) => {
              const authorId = comment.author?._id || comment.author;

              const isOwner = currentUserId === authorId;

              const isEditing = editingCommentId === comment._id;

              const authorName =
                comment.author && typeof comment.author === "object"
                  ? `${comment.author.firstName} ${comment.author.lastName}`
                  : "User";

              const initials =
                comment.author && typeof comment.author === "object"
                  ? `${comment.author.firstName?.[0] || ""}${
                      comment.author.lastName?.[0] || ""
                    }`.toUpperCase()
                  : "?";

              return (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">{initials}</div>

                  <div className="comment-body">
                    <div className="comment-header">
                      <div>
                        <strong>{authorName}</strong>

                        {comment.createdAt && (
                          <span>
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {!isEditing && isOwner && (
                        <div className="comment-actions">
                          <button
                            type="button"
                            onClick={() => handleStartEditComment(comment)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="comment-delete"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <p className="comment-content">{comment.content}</p>
                    )}

                    {isEditing && isOwner && (
                      <div className="comment-edit-area">
                        <textarea
                          value={editCommentContent}
                          onChange={(event) =>
                            setEditCommentContent(event.target.value)
                          }
                        />

                        <div className="comment-edit-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={editingComment}
                            onClick={() => handleSaveComment(comment._id)}
                          >
                            {editingComment ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleCancelEditComment}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD COMMENT */}

        <div className="add-comment-area">
          <h3>Add Comment</h3>

          <form onSubmit={handleAddComment}>
            <textarea
              value={commentContent}
              placeholder="Write a comment..."
              onChange={(event) => setCommentContent(event.target.value)}
              required
            />

            <div className="add-comment-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingComment}
              >
                {addingComment ? "Adding..." : "Add Comment"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* DELETE TASK */}

      {canDeleteTask && (
        <section className="card danger-zone task-danger-zone">
          <div className="danger-zone-content">
            <div>
              <h2>Delete Task</h2>

              <p className="mb-0">
                Permanently delete this task and its comments and activity. This
                action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteTask}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Task"}
            </button>
          </div>

          {deleteError && (
            <div className="alert alert-error task-delete-error">
              {deleteError}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
