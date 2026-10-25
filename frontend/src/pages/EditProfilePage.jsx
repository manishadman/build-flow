import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function EditProfileForm({ user, updateUser }) {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const unchanged =
    firstName.trim() === (user.firstName || "") &&
    lastName.trim() === (user.lastName || "") &&
    email.trim().toLowerCase() === (user.email || "").toLowerCase() &&
    phone.trim() === (user.phone || "");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    setError("");

    if (!trimmedFirstName || !trimmedLastName) {
      setError("First name and last name are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address");
      return;
    }

    if (trimmedPhone) {
      const digits = trimmedPhone.replace(/\D/g, "");

      if (
        !/^[0-9+().\-\s]+$/.test(trimmedPhone) ||
        digits.length < 7 ||
        digits.length > 15
      ) {
        setError("Enter a valid telephone number");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await api.patch("/users/me", {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        phone: trimmedPhone,
      });

      updateUser(response.data);
      navigate("/profile");
    } catch (submitError) {
      setError(
        submitError.response?.data?.message || "Failed to update profile",
      );
      setSaving(false);
    }
  }

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div>
          <h1>Edit profile</h1>

          <p className="page-subtitle">
            Update the name, email, and telephone number on your BuildFlow
            account.
          </p>
        </div>
      </div>

      <div className="card profile-information-card profile-edit-card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="profileFirstName">First name</label>

              <input
                id="profileFirstName"
                type="text"
                value={firstName}
                placeholder="First name"
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setError("");
                }}
                autoComplete="given-name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileLastName">Last name</label>

              <input
                id="profileLastName"
                type="text"
                value={lastName}
                placeholder="Last name"
                onChange={(event) => {
                  setLastName(event.target.value);
                  setError("");
                }}
                autoComplete="family-name"
                required
              />
            </div>

            <div className="form-group profile-form-full">
              <label htmlFor="profileEmail">Email address</label>

              <input
                id="profileEmail"
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                autoComplete="email"
                required
              />

              <p className="profile-field-hint">
                You sign in with this email address.
              </p>
            </div>

            <div className="form-group profile-form-full">
              <label htmlFor="profilePhone">Telephone number</label>

              <input
                id="profilePhone"
                type="tel"
                value={phone}
                placeholder="(555) 123-4567"
                onChange={(event) => {
                  setPhone(event.target.value);
                  setError("");
                }}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <Link to="/profile" className="btn btn-secondary">
              Cancel
            </Link>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || unchanged}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();

  if (!user) {
    return (
      <div className="page">
        <div className="card">
          <p className="mb-0">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <EditProfileForm
      key={user._id || user.id}
      user={user}
      updateUser={updateUser}
    />
  );
}
