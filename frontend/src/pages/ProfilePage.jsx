import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user } = useAuth();

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "BuildFlow User";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "BF";

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>

          <p className="page-subtitle">Your BuildFlow account information.</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="card profile-identity-card">
          <div className="profile-avatar">{initials}</div>

          <h2>{fullName}</h2>

          <p>{user?.email || "No email available"}</p>

          <span className="badge badge-info">BuildFlow Member</span>
        </div>

        <div className="card profile-information-card">
          <div className="card-header">
            <div>
              <h2>Account Information</h2>

              <p>Information associated with your BuildFlow account.</p>
            </div>
          </div>

          <div className="profile-information-grid">
            <div className="profile-field">
              <span className="profile-field-label">First name</span>

              <span className="profile-field-value">{firstName || "—"}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">Last name</span>

              <span className="profile-field-value">{lastName || "—"}</span>
            </div>

            <div className="profile-field profile-field-full">
              <span className="profile-field-label">Email address</span>

              <span className="profile-field-value">{user?.email || "—"}</span>
            </div>
          </div>

          <div className="profile-security-note">
            <div className="profile-security-icon">✓</div>

            <div>
              <strong>Authenticated account</strong>

              <p>
                Your session is protected using BuildFlow's authentication
                system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
