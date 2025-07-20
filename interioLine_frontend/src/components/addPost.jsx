import axios from "axios";
import { useState } from "react";
import { useAuth } from "../provider/authcontext";
import "./addpost.css";
import Toast from "./toastMessage.jsx";
import { AnimatePresence } from "framer-motion"; 
export default function AddPortfolioModal({ onClose }) {
    const [toast, setToast] = useState(null);

    const [newPost, setNewPost] = useState({
        title: "",
        room_type: "",
        tags: "",
        captions: [""],
        primaryIndex: 0,
    });

    const [selectedImages, setSelectedImages] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { userId, isUserIdAvailable, getToken } = useAuth();

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (selectedImages.length === 0) {
            // First time selecting images
            processImages(files);
        } else {
            // Adding more images to existing ones
            addMoreImages(files);
        }
    };

    const processImages = (files) => {
        setSelectedImages(files);
        setNewPost((prev) => ({
            ...prev,
            captions: Array(files.length).fill(""),
            primaryIndex: 0, // Reset to first image
        }));
    };

    const addMoreImages = (newFiles) => {
        const combinedImages = [...selectedImages, ...newFiles];
        const newCaptions = [...newPost.captions, ...Array(newFiles.length).fill("")];

        setSelectedImages(combinedImages);
        setNewPost((prev) => ({
            ...prev,
            captions: newCaptions
        }));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files).filter(file =>
                file.type.startsWith('image/')
            );
            if (selectedImages.length === 0) {
                processImages(files);
            } else {
                addMoreImages(files);
            }
        }
    };

    const handleCaptionChange = (index, value) => {
        const updatedCaptions = [...newPost.captions];
        updatedCaptions[index] = value;
        setNewPost((prev) => ({ ...prev, captions: updatedCaptions }));
    };

    const setPrimaryImage = (index) => {
        setNewPost((prev) => ({ ...prev, primaryIndex: index }));
    };

    const removeImage = (indexToRemove) => {
        const newImages = selectedImages.filter((_, index) => index !== indexToRemove);
        const newCaptions = newPost.captions.filter((_, index) => index !== indexToRemove);

        setSelectedImages(newImages);
        setNewPost((prev) => ({
            ...prev,
            captions: newCaptions,
            primaryIndex: prev.primaryIndex >= indexToRemove && prev.primaryIndex > 0
                ? prev.primaryIndex - 1
                : prev.primaryIndex
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!isUserIdAvailable()) {
            setError("Authentication error. Please log in again.");
            return;
        }

        if (selectedImages.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("title", newPost.title);
        formData.append("room_type", newPost.room_type);
        formData.append("tags", newPost.tags);
        formData.append("primaryIndex", newPost.primaryIndex);
        formData.append("designer", userId); // 🔐 Use userId from auth context

        newPost.captions.forEach((caption, index) => {
            formData.append(`captions[${index}]`, caption);
        });

        selectedImages.forEach((image) => {
            formData.append("images", image);
        });

        try {
            const token = getToken();
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            };

            await axios.post("http://localhost:2005/api/portfolio/create", formData, config);

           setToast({ message: "Post uploaded successfully!", type: "success" });

            onClose();
        } catch (error) {
            console.error("❌ Upload failed:", error);

            if (error.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else if (error.response?.status === 403) {
                setError("Access denied. You don't have permission to create portfolio posts.");
            } else {
                setError(error.response?.data?.errors?.[0] || "Failed to upload post. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
    if (!isUserIdAvailable()) {
        return (
            <div className="portfolio-overlay">
                <div className="portfolio-modal">
                    <div className="portfolio-header">
                        <h2 style={{ color: "#dc3545" }}>Authentication Required</h2>
                        <button onClick={onClose} className="close-btn">&times;</button>
                    </div>
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        <p>Please log in to add portfolio posts.</p>
                        <button onClick={onClose} className="btn btn-cancel-compact">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="portfolio-overlay">
            <div className="portfolio-modal">
                <div className="portfolio-header">
                    <h2>Add Portfolio Post</h2>
                    <button onClick={onClose} className="close-btn" disabled={loading}>
                        &times;
                    </button>

                </div>

                {/* Error message */}
                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px',
                        margin: '0 20px',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="portfolio-form">
                    {/* Basic Info Grid */}
                    <div className="form-grid">
                        <div className="form-row">
                            <div className="form-group-half">
                                <label className="form-label-compact">Project Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Modern Living Room"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    required
                                    className="form-input-compact"
                                    disabled={loading}
                                />
                            </div>

                        </div>

                        <div className="form-group-full">
                            <label className="form-label-compact">Tags</label>
                            <input
                                type="text"
                                placeholder="modern, minimalist, luxury (comma separated)"
                                value={newPost.tags}
                                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                className="form-input-compact"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="upload-section">
                        <label className="form-label-compact">Project Images</label>
                        <div
                            className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${selectedImages.length > 0 ? 'has-images' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {selectedImages.length === 0 ? (
                                <div className="upload-prompt">
                                    <div className="upload-icon">📷</div>
                                    <p className="upload-text">Drag & drop images here</p>
                                    <p className="upload-subtext">or click to browse</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="file-input-hidden"
                                        id="image-upload"
                                        disabled={loading}
                                    />
                                    <label htmlFor="image-upload" className="upload-button">
                                        Choose Images
                                    </label>
                                </div>
                            ) : (
                                <div className="image-grid">
                                    {selectedImages.map((file, index) => (
                                        <div key={index} className={`image-item ${index === newPost.primaryIndex ? 'primary' : ''}`}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Upload ${index + 1}`}
                                                className="image-preview"
                                            />
                                            <div className="image-overlay">
                                                <button
                                                    type="button"
                                                    onClick={() => setPrimaryImage(index)}
                                                    className={`primary-btn ${index === newPost.primaryIndex ? 'active' : ''}`}
                                                    title="Set as primary image"
                                                    disabled={loading}
                                                >
                                                    {index === newPost.primaryIndex ? '★' : '☆'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="remove-btn"
                                                    title="Remove image"
                                                    disabled={loading}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Add caption..."
                                                value={newPost.captions[index] || ""}
                                                onChange={(e) => handleCaptionChange(index, e.target.value)}
                                                className="caption-input"
                                                disabled={loading}
                                            />
                                        </div>
                                    ))}
                                    <div className="add-more-btn">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                addMoreImages(files);
                                                // Reset the input so the same files can be selected again if needed
                                                e.target.value = '';
                                            }}
                                            className="file-input-hidden"
                                            id="add-more-images"
                                            disabled={loading}
                                        />
                                        <label htmlFor="add-more-images" className="add-more-label">
                                            <span className="add-icon">+</span>
                                            <span className="add-text">Add More</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Primary Image Info */}
                    {selectedImages.length > 0 && (
                        <div className="primary-info">
                            <span className="primary-label">
                                ★ Primary: {selectedImages[newPost.primaryIndex]?.name}
                            </span>
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
                            disabled={loading || selectedImages.length === 0}
                            style={{
                                opacity: loading || selectedImages.length === 0 ? 0.6 : 1,
                                cursor: loading || selectedImages.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Uploading...' : 'Upload Portfolio'}
                        </button>
                    </div>
                </form>
            </div>
            <AnimatePresence>
    {toast && <Toast message={toast.message} type={toast.type} />}
</AnimatePresence>

        </div>
    );
}