import "./AuthPromptModal.css";

export default function AuthPromptModal({
  variant,
  onClose,
  onLoginStartProject,
  onPickDesignerStart
}) {
  let title = "Action Required";
  let message = "";
  let buttonText = "";
  let buttonAction = onClose;

  if (variant === "notLoggedIn") {
    message = "To continue designing your dream room, please login and start a project with a designer. This ensures your designs are saved and linked to your profile.";
    buttonText = "Login & Start Project";
    buttonAction = onLoginStartProject;
  } else if (variant === "noProject") {
    message = "To edit this room, please pick a designer and start your project first. This helps us customize your experience and link your designs.";
    buttonText = "Pick Designer & Start Project";
    buttonAction = onPickDesignerStart;
  }

  return (
    <div className="auth-prompt-overlay">
      <div className="auth-prompt-container">
        <div className="auth-prompt-header">
          <h2 style={{ color: "#A4502F" }}>{title}</h2>
        </div>
        <div className="auth-prompt-body">
          <p>{message}</p>
        </div>
        <div className="auth-prompt-actions center-actions">
          <button
            onClick={buttonAction}
            className="btn btn-submit-compact"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
