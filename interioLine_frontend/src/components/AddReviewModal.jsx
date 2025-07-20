import { Star, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../provider/authcontext";
import "./AddReviewModal.css";

const AddReviewModal = ({ isOpen, onClose, projectInfo, onSubmitSuccess }) => {
    const { userId } = useAuth();

    const [formData, setFormData] = useState({
        rating: 0,
        comment: ""
    });
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear errors when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.rating || formData.rating < 1) {
            newErrors.rating = "Please select a rating";
        }

        if (!formData.comment.trim()) {
            newErrors.comment = "Please write a review comment";
        } else if (formData.comment.trim().length < 10) {
            newErrors.comment = "Review comment must be at least 10 characters";
        } else if (formData.comment.trim().length > 500) {
            newErrors.comment = "Review comment must be less than 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:2005/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: projectInfo.id,
                    rating: formData.rating,
                    comment: formData.comment.trim(),
                    client_id: userId,
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                onSubmitSuccess && onSubmitSuccess(data.review);
                onClose();

                // Reset form
                setFormData({ rating: 0, comment: "" });
                setErrors({});
            } else {
                // Handle API errors
                setErrors({ submit: data.message || "Failed to submit review" });
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            setErrors({ submit: "Network error. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle modal close
    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({ rating: 0, comment: "" });
            setErrors({});
            setHoveredRating(0);
            onClose();
        }
    };

    // Render star rating
    const renderStarRating = () => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star-button ${star <= (hoveredRating || formData.rating) ? 'star-filled' : 'star-empty'
                            }`}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleInputChange('rating', star)}
                        disabled={isSubmitting}
                    >
                        <Star className="star-icon" />
                    </button>
                ))}
                <span className="rating-text">
                    {hoveredRating || formData.rating ?
                        `${hoveredRating || formData.rating} star${(hoveredRating || formData.rating) !== 1 ? 's' : ''}` :
                        'Click to rate'
                    }
                </span>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay" onClick={handleClose}>
            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="review-modal-header">
                    <h2>Add Review</h2>
                    <button
                        className="close-button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <X className="close-icon" />
                    </button>
                </div>

                {/* Project Info */}
                <div className="project-info-section">
                    <h3>Project: {projectInfo.title}</h3>
                    <p>Share your experience with this interior design project</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="review-form">
                    {/* Rating Section */}
                    <div className="form-group">
                        <label className="form-label">Rating *</label>
                        {renderStarRating()}
                        {errors.rating && (
                            <span className="error-message">{errors.rating}</span>
                        )}
                    </div>

                    {/* Comment Section */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="comment">
                            Your Review *
                        </label>
                        <textarea
                            id="comment"
                            className={`form-textarea ${errors.comment ? 'error' : ''}`}
                            placeholder="Share your thoughts about the design, communication, timeliness, and overall experience..."
                            value={formData.comment}
                            onChange={(e) => handleInputChange('comment', e.target.value)}
                            rows={4}
                            maxLength={500}
                            disabled={isSubmitting}
                        />
                        <div className="textarea-info">
                            <span className={`char-count ${formData.comment.length > 450 ? 'char-warning' : ''}`}>
                                {formData.comment.length}/500
                            </span>
                        </div>
                        {errors.comment && (
                            <span className="error-message">{errors.comment}</span>
                        )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="submit-error">
                            {errors.submit}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn-submit ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="submit-spinner"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Star className="submit-icon" />
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReviewModal;