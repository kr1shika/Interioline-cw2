import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header.jsx";
import { useAuth } from "../../provider/authcontext";
import "../style/styleQuiz.css";
import { getCsrfToken } from "../../provider/csrf"; // or your correct path

// Import images
import bedroom from "../../assets/images/quiz/bedroom.png";
import kitchen from "../../assets/images/quiz/kitchen.png";
import livingRoom from "../../assets/images/quiz/livingRoom.png";

import bohemian from "../../assets/images/quiz/qbohemian.png";
import minimalist from "../../assets/images/quiz/qminimalist.png";
import modern from "../../assets/images/quiz/qmodern.png";
import scandinavian from "../../assets/images/quiz/qscandinavian.png";
import traditional from "../../assets/images/quiz/qtraditional.png";

import balanced from "../../assets/images/quiz/balanced.png";
import bold from "../../assets/images/quiz/bold.png";
import calm from "../../assets/images/quiz/calm.png";

import boldColors from "../../assets/images/quiz/boldColors.png";
import coolTones from "../../assets/images/quiz/coolTones.png";
import softPastels from "../../assets/images/quiz/softPastels.png";
import warmNeutrals from "../../assets/images/quiz/warmNeutrals.png";

const questions = [
    {
        id: 1,
        title: "What type of space are you designing?",
        options: ["Living Room", "Bedroom", "Kitchen"],
    },
    {
        id: 2,
        title: "Which interior style do you resonate with the most?",
        options: ["Scandinavian", "Modern", "Bohemian", "Minimalist", "Traditional"],
    },
    {
        id: 3,
        title: "Do you prefer bold or subtle design choices?",
        subtitle: "(Pick the lamp that best reflects your style)",
        options: ["Bold and unique", "Calm and simple", "Somewhere in between"],
    },
    {
        id: 4,
        title: "What color tones do you prefer for your space?",
        options: ["Warm Neutrals", "Cool Tones", "Bold Colors", "Soft Pastels"],
    },
    {
        id: 5,
        title: "How important is functionality over decoration for you?",
        options: [
            "I care more about decoration",
            "Slightly more decorative",
            "Balanced",
            "Slightly more functional",
            "I care more about functionality",
        ],
    },
    {
        id: 6,
        title: "How quickly do you want your project completed?",
        options: ["Within 2 weeks", "Within a month", "Flexible, as long as it's perfect"],
    },
    {
        id: 7,
        title: "What is your estimated budget range for the project?",
        options: [
            "Under NPR 20,000",
            "NPR 20,000 – NPR 70,000",
            "NPR 70,000 – NPR 150,000",
            "Above NPR 1,50,000",
        ],
    },
];

const optionImages = {
    "Living Room": livingRoom,
    "Bedroom": bedroom,
    "Kitchen": kitchen,
    "Scandinavian": scandinavian,
    "Modern": modern,
    "Bohemian": bohemian,
    "Minimalist": minimalist,
    "Traditional": traditional,
    "Bold and unique": bold,
    "Calm and simple": calm,
    "Somewhere in between": balanced,
    "Warm Neutrals": warmNeutrals,
    "Cool Tones": coolTones,
    "Bold Colors": boldColors,
    "Soft Pastels": softPastels,
};

export default function StyleMatchQuiz() {
    const { userId } = useAuth();
    const [answers, setAnswers] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    const handleOptionClick = (option) => {
        if (isTransitioning) return; // Prevent multiple clicks during transition

        // Set the selected option for visual feedback
        setSelectedOption(option);

        // Update answers immediately
        setAnswers((prev) => ({
            ...prev,
            [questions[currentStep].id]: option,
        }));

        // Auto advance to next question with smooth transition
        if (currentStep < questions.length - 1) {
            setIsTransitioning(true);

            setTimeout(() => {
                setCurrentStep(currentStep + 1);

                // Scroll AFTER the new question is mounted & DOM updated
                setTimeout(() => {
                    scrollToQuestion(currentStep + 1);

                    // Clear selected option and transition state after animation
                    setTimeout(() => {
                        setSelectedOption(null);
                        setIsTransitioning(false);
                    }, 600);
                }, 50); // slight delay to let React update DOM

            }, 200);
        }
        else {
            // Clear selection state for last question
            setTimeout(() => {
                setSelectedOption(null);
            }, 300);
        }
    };

    const handleStepClick = (index) => {
        if (isTransitioning) return;

        const maxAccessibleStep = Math.max(
            ...Object.keys(answers).map(key => questions.findIndex(q => q.id === parseInt(key))),
            currentStep
        );

        if (index <= maxAccessibleStep) {
            setIsTransitioning(true);
            setCurrentStep(index);

            setTimeout(() => {
                scrollToQuestion(index);

                setTimeout(() => {
                    setIsTransitioning(false);
                }, 600);
            }, 50); // slight delay for smoother scroll
        }
    };


    const handlePrevious = () => {
        if (currentStep > 0 && !isTransitioning) {
            setIsTransitioning(true);
            setCurrentStep(currentStep - 1);

            setTimeout(() => {
                scrollToQuestion(currentStep - 1);

                setTimeout(() => {
                    setIsTransitioning(false);
                }, 600);
            }, 50); // small delay for DOM paint
        }
    };


    const handleNext = () => {
        if (currentStep < questions.length - 1 && answers[questions[currentStep].id] && !isTransitioning) {
            // Remove transition for next button - directly go to next question
            setCurrentStep(currentStep + 1);
            scrollToQuestion(currentStep + 1);
        }
    };

    const scrollToQuestion = (index) => {
        const questionEl = containerRef.current?.querySelector(`#question-${index}`);
        if (questionEl) {
            questionEl.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest"
            });
        }
    };

    useEffect(() => {
        scrollToQuestion(currentStep);
    }, [currentStep]);

    const handleSubmit = async () => {
        if (!answers[questions[questions.length - 1].id] || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const csrfToken = await getCsrfToken();

            const res = await fetch("https://localhost:2005/api/match/submit", {
                method: "POST",
                body: JSON.stringify({ userId, answers }),
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            const data = await res.json();

            if (data?.match) {
                navigate("/results", {
                    state: {
                        userName: data?.user?.full_name,
                        match: {
                            _id: data.match._id,
                            full_name: data.match.full_name,
                            specialization: data.match.specialization,
                            profilepic: data.match.profilepic || "/default-avatar.png",
                            experience: data.match.experience || 0,
                        },
                        matchPercentage: data.matchPercentage || 0,
                        styleAnalysis: data.styleAnalysis || "No style analysis available",
                    }
                });
            } else {
                navigate("/match-result", {
                    state: {
                        userName: data?.user?.full_name,
                        match: null,
                        matchPercentage: 0,
                        styleAnalysis: data.styleAnalysis || "No style analysis available",
                    }
                });
            }
        } catch (err) {
            console.error("Error submitting quiz:", err);
            alert("Something went wrong while submitting.");
            setIsSubmitting(false);
        }
    };

    // Calculate if we can proceed to the next question
    const canProceed = answers[questions[currentStep]?.id] !== undefined;

    // Calculate progress percentage with smooth animation
    const answeredQuestions = Object.keys(answers).length;
    const progressPercentage = Math.round((answeredQuestions / questions.length) * 100);

    return (
        <div className="quiz-container">
            <Header onGetStartedClick={() => { }} />

            <div className="quiz-content">
                {/* Progress bar */}
                <div className="progress-section">
                    <div className="progress-info">
                        <span>Question {currentStep + 1} of {questions.length}</span>
                        <span>{progressPercentage}% Complete</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className={`questions-container ${isTransitioning ? 'transitioning' : ''}`}
                >
                    {questions.map((q, index) => {
                        const isCurrentStep = index === currentStep;
                        const isPreviousStep = index < currentStep;
                        const isAnswered = answers[q.id] !== undefined;

                        return (
                            <div
                                key={q.id}
                                id={`question-${index}`}
                                className={`question-card ${isCurrentStep ? 'current' : ''} ${isPreviousStep ? 'previous' : ''} ${!isCurrentStep && !isPreviousStep ? 'future' : ''} ${isTransitioning ? 'transitioning' : ''}`}
                                onClick={() => isPreviousStep && handleStepClick(index)}
                            >
                                <h2 className="question-title">
                                    {q.title}
                                </h2>
                                {q.subtitle && (
                                    <p className="question-subtitle">{q.subtitle}</p>
                                )}

                                <div className={`options-grid ${q.options.length > 6 ? 'large-grid' : ''}`}>
                                    {q.options.map((option) => {
                                        const isSelected = answers[q.id] === option;
                                        const isCurrentlySelected = selectedOption === option && isCurrentStep;

                                        return (
                                            <button
                                                key={option}
                                                disabled={!isCurrentStep || isTransitioning}
                                                onClick={() => handleOptionClick(option)}
                                                className={`option-button ${q.options.length > 5 ? 'small' : 'large'} ${isSelected ? 'selected' : ''} ${isCurrentlySelected ? 'selecting' : ''} ${!isCurrentStep ? 'disabled' : ''} ${isTransitioning ? 'transitioning' : ''}`}
                                            >
                                                {optionImages[option] ? (
                                                    <div className="option-image-container">
                                                        <img
                                                            src={optionImages[option]}
                                                            alt={option}
                                                            className={`option-image ${["Living Room", "Bedroom", "Kitchen", "Scandinavian", "Modern", "Bohemian", "Minimalist", "Traditional", "Warm Neutrals", "Cool Tones", "Bold Colors", "Soft Pastels"].includes(option) ? 'rounded' : 'square'}`}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="option-icon-container">
                                                        <div className={`option-icon ${isSelected ? 'selected' : ''} ${isCurrentlySelected ? 'selecting' : ''}`}>
                                                            {(isSelected || isCurrentlySelected) ? "✓" : ""}
                                                        </div>
                                                    </div>
                                                )}
                                                <span className={`option-text ${isSelected ? 'selected' : ''} ${isCurrentlySelected ? 'selecting' : ''}`}>
                                                    {option}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="navigation-buttons">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0 || isTransitioning}
                        className={`nav-button prev ${currentStep === 0 || isTransitioning ? 'disabled' : ''}`}
                    >
                        <svg xmlns="https://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="nav-text">Previous</span>
                    </button>

                    {currentStep < questions.length - 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed}
                            className={`nav-button next ${!canProceed ? 'disabled' : ''}`}
                        >
                            <span className="nav-text">Next</span>
                            <svg xmlns="https://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed || isSubmitting || isTransitioning}
                            className={`submit-button ${!canProceed || isSubmitting || isTransitioning ? 'disabled' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="loading-spinner" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span className="nav-text">Submit & Match</span>
                                    <svg xmlns="https://www.w3.org/2000/svg" className="submit-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}