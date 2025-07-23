import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../../provider/authcontext";
import "../../style/EditProfileForm.css";
import PreferenceQuiz from "./PreferenceQuiz";

export default function EditProfileForm({ designer, onClose }) {
  const [full_name, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [file, setFile] = useState(null);
  const [preferredTones, setPreferredTones] = useState([]);
  const [approach, setApproach] = useState("Balanced");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { userId, userRole, updateUserProfile, isUserIdAvailable, getToken } = useAuth();
  const isClient = userRole === 'client';
  const isDesigner = userRole === 'designer';

  useEffect(() => {
    if (designer) {
      setFullName(designer.full_name || "");
      setBio(designer.bio || "");
      setEmail(designer.email || "");
      setSpecialization(designer.specialization || "");
      setExperience(designer.experience || "");
      setPreferredTones(designer.preferredTones || []);
      setApproach(designer.approach || "Balanced");

      if (isDesigner) {
        const hasQuizData =
          designer.preferredTones?.length > 0 ||
          designer.approach !== "Balanced" ||
          designer.specialization;
        setQuizCompleted(hasQuizData);
      }
    }
  }, [designer, isDesigner]);

  const handleQuizComplete = (quizData) => {
    setPreferredTones(quizData.preferredTones);
    setApproach(quizData.approach);
    setSpecialization(quizData.specialization);
    setQuizCompleted(true);
    setShowQuiz(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("full_name", full_name);

    if (isClient) {
      data.append("email", email);
    } else {
      data.append("bio", bio);
      data.append("specialization", specialization);
      data.append("experience", experience);
      data.append("approach", approach);
      preferredTones.forEach((tone) => data.append("preferredTones", tone));
    }

    if (file) data.append("profilepic", file);

    try {
      const response = await axios.put("/api/user/update", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      updateUserProfile(response.data.user); // context update
      console.log("✅ Profile updated");
      onClose();
    } catch (err) {
      console.error("❌ Profile update failed:", err);
      const code = err.response?.status;
      if (code === 401) setError("Session expired. Please log in again.");
      else if (code === 403) setError("Access denied.");
      else setError(err.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="edit-profile-container">
        <div className="profile-header">
          <h2 style={{ color: "#A4502F " }}>Edit {isClient ? 'Client' : 'Designer'} Profile</h2>
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '8px 12px',
              borderRadius: '4px',
              marginTop: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form-compact">
          {/* Profile Picture Section */}
          <div className="profile-pic-section">
            <div className="pic-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="file-input-hidden"
                id="profile-pic-input"
                disabled={loading}
              />
              <label htmlFor="profile-pic-input" className="pic-upload-label">
                {file ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="profile-preview-large" />
                ) : designer?.profilepic ? (
                  <img src={`https://localhost:2005${designer.profilepic}`} alt="Current" className="profile-preview-large" />
                ) : (
                  <div className="pic-placeholder">
                    <span className="pic-icon">📷</span>
                    <span className="pic-text">Upload Photo</span>
                  </div>
                )}
              </label>
            </div>
          </div>


          {/* Form Grid */}
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group-half">
                <label className="form-label-compact">Full Name</label>
                <input
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input-compact"
                  required
                  disabled={loading}
                />
              </div>
              {isDesigner && (
                <div className="form-group-half">
                  <label className="form-label-compact">Experience (Years)</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="form-input-compact"
                    min="0"
                    placeholder="5"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {isDesigner ? (
              <div className="form-group-full">
                <label className="form-label-compact">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="form-textarea-compact"
                  placeholder="Brief description of your design philosophy..."
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="form-group-full">
                <label className="form-label-compact">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input-compact"
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Preference Quiz Section - Only for Designers */}
          {isDesigner && (
            <div className="preference-compact">
              <div className="preference-title">
                <span className="quiz-emoji">🎨</span>
                <span>Design Preferences</span>
                {quizCompleted && <span className="completed-badge">✓</span>}
              </div>

              {quizCompleted ? (
                <div className="quiz-summary-compact">
                  <div className="summary-chips">
                    {specialization && <span className="chip">{specialization}</span>}
                    {approach && <span className="chip">{approach}</span>}
                    {preferredTones.length > 0 && <span className="chip">{preferredTones.length} color{preferredTones.length > 1 ? 's' : ''}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuiz(true)}
                    className="btn-edit-preferences"
                    disabled={loading}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="quiz-prompt-compact">
                  <span className="quiz-prompt-text">Complete to help clients find you</span>
                  <button
                    type="button"
                    onClick={() => setShowQuiz(true)}
                    className="btn-take-quiz"
                    disabled={loading}
                  >
                    Take Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-cancel-compact"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-submit-compact"
              disabled={loading || (isDesigner && !quizCompleted)}
              style={{
                opacity: loading || (isDesigner && !quizCompleted) ? 0.6 : 1,
                cursor: loading || (isDesigner && !quizCompleted) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {showQuiz && isDesigner && (
        <PreferenceQuiz
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
          initialData={{
            specialization,
            approach,
            preferredTones
          }}
        />
      )}
    </>
  );
}