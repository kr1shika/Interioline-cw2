import { useState } from "react";
import "../../style/PreferenceQuiz.css";

export default function PreferenceQuiz({ onComplete, onClose, initialData = {} }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    specialization: initialData.specialization || "",
    approach: initialData.approach || "Balanced",
    preferredTones: initialData.preferredTones || []
  });

  const questions = [
    {
      id: "specialization",
      title: "What's your primary design specialization?",
      type: "select",
      options: [

        "Minimalist Design",
        "Traditional Design",
        "Modern Contemporary",
        "Industrial Design",
        "Scandinavian Design"
      ]
    },
    {
      id: "approach",
      title: "How would you describe your design approach?",
      type: "radio",
      options: [
        { value: "Functional", label: "Functional", description: "Focus on practicality and usability" },
        { value: "Balanced", label: "Balanced", description: "Equal emphasis on form and function" },
        { value: "Decorative", label: "Decorative", description: "Emphasis on aesthetics and visual appeal" }
      ]
    },
    {
      id: "preferredTones",
      title: "What color palettes do you prefer working with?",
      subtitle: "Select all that apply",
      type: "checkbox",
      options: [
        { value: "Warm Neutrals", label: "Warm Neutrals", description: "Beiges, creams, warm grays" },
        { value: "Cool Tones", label: "Cool Tones", description: "Blues, greens, cool grays" },
        { value: "Bold Colors", label: "Bold Colors", description: "Vibrant reds, deep blues, rich purples" },
        { value: "Soft Pastels", label: "Soft Pastels", description: "Light pinks, soft yellows, pale blues" },
        { value: "Monochromatic", label: "Monochromatic", description: "Black, white, and gray variations" },
        { value: "Earth Tones", label: "Earth Tones", description: "Browns, terracotta, forest greens" }
      ]
    }
  ];

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => {
      if (questions.find(q => q.id === questionId)?.type === "checkbox") {
        const currentValues = prev[questionId] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [questionId]: newValues };
      }
      return { ...prev, [questionId]: value };
    });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Pass all the quiz data back to parent immediately
    const coreData = {
      specialization: answers.specialization,
      approach: answers.approach,
      preferredTones: answers.preferredTones
    };
    onComplete(coreData);
    // Don't close here - let parent handle it
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "checkbox") {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer && answer.trim() !== "";
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal">
        <div className="quiz-header">
          <h2>Design Preference Quiz</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">
            Question {currentStep + 1} of {questions.length}
          </span>
        </div>

        <div className="quiz-content">
          <div className="question-section">
            <h3>{currentQuestion.title}</h3>
            {currentQuestion.subtitle && (
              <p className="question-subtitle">{currentQuestion.subtitle}</p>
            )}

            <div className="options-container">
              {currentQuestion.type === "select" && (
                <select
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="quiz-select"
                >
                  <option value="">Select your specialization...</option>
                  {currentQuestion.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}

              {currentQuestion.type === "radio" && (
                <div className="radio-options">
                  {currentQuestion.options.map(option => (
                    <label key={option.value} className="radio-option">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option.value}
                        checked={answers[currentQuestion.id] === option.value}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      />
                      <div className="radio-content">
                        <span className="radio-label">{option.label}</span>
                        {option.description && (
                          <span className="radio-description">{option.description}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === "checkbox" && (
                <div className="checkbox-options">
                  {currentQuestion.options.map(option => (
                    <label key={option.value} className="checkbox-option">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={(answers[currentQuestion.id] || []).includes(option.value)}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      />
                      <div className="checkbox-content">
                        <span className="checkbox-label">{option.label}</span>
                        {option.description && (
                          <span className="checkbox-description">{option.description}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>

          <div className="nav-buttons">
            {isLastStep ? (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="btn btn-submit"
              >
                Complete Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}