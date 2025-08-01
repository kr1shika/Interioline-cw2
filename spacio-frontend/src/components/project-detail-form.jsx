import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { getCsrfToken } from "../provider/csrf";
import "./addpost.css";
import Toast from "./toastMessage.jsx";

export default function UploadRoomDataModal({ onClose, projectId }) {
    const [roomData, setRoomData] = useState({
        length: "",
        width: "",
        height: "",
        description: ""
    });

    const [selectedImages, setSelectedImages] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState("success");
    const handleInputChange = (field, value) => {
        setRoomData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (selectedImages.length === 0) {
            processImages(files);
        } else {
            addMoreImages(files);
        }
    };

    const processImages = (files) => {
        setSelectedImages(files);
    };

    const addMoreImages = (newFiles) => {
        const combinedImages = [...selectedImages, ...newFiles];
        setSelectedImages(combinedImages);
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

    const removeImage = (indexToRemove) => {
        const newImages = selectedImages.filter((_, index) => index !== indexToRemove);
        setSelectedImages(newImages);
    };

    const validateForm = () => {
        const { length, width, height, description } = roomData;

        if (!length && !width && !height && !description && selectedImages.length === 0) {
            alert("Please provide at least room dimensions, description, or room images.");
            return false;
        }

        if (length && (isNaN(length) || parseFloat(length) <= 0)) {
            alert("Please enter a valid length.");
            return false;
        }
        if (width && (isNaN(width) || parseFloat(width) <= 0)) {
            alert("Please enter a valid width.");
            return false;
        }
        if (height && (isNaN(height) || parseFloat(height) <= 0)) {
            alert("Please enter a valid height.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();

        if (roomData.length) formData.append("length", roomData.length);
        if (roomData.width) formData.append("width", roomData.width);
        if (roomData.height) formData.append("height", roomData.height);

        if (roomData.description.trim()) {
            formData.append("description", roomData.description.trim());
        }

        selectedImages.forEach((image) => {
            formData.append("room_images", image);
        });

        try {
            const csrfToken = await getCsrfToken();

            await axios.patch(
                `https://localhost:2005/api/project/${projectId}/room-details`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", "CSRF-Token": csrfToken
                    },
                    withCredentials: true  // <-- this is necessary
                }
            );

            setToastType("success");
            setToastMessage("Project initialized and details have been saved");
            setTimeout(() => {
                setToastMessage(null);
                onClose();
            }, 2500);

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to update room details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="portfolio-overlay">
            <div className="portfolio-modal">
                <div className="portfolio-header" style={{ padding: '15px' }}>
                    <h2>Update Room Details</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="portfolio-form">
                    {/* Room Dimensions Grid */}
                    <div className="form-grid">
                        <div className="form-row">
                            <div className="form-group-half">
                                <label className="form-label-compact">Length (feet)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g. 12.5"
                                    value={roomData.length}
                                    onChange={(e) => handleInputChange('length', e.target.value)}
                                    className="form-input-compact"
                                />
                            </div>
                            <div className="form-group-half">
                                <label className="form-label-compact">Width (feet)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g. 10.0"
                                    value={roomData.width}
                                    onChange={(e) => handleInputChange('width', e.target.value)}
                                    className="form-input-compact"
                                />
                            </div>

                            <div className="form-group-half">
                                <label className="form-label-compact">Height (feet)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g. 9.0"
                                    value={roomData.height}
                                    onChange={(e) => handleInputChange('height', e.target.value)}
                                    className="form-input-compact"
                                />
                            </div>
                        </div>
                        <div className="form-group-full" style={{ marginBottom: '-20px' }}>
                            <label className="form-label-compact">Room Description</label>
                            <textarea
                                placeholder="Describe the room layout, existing furniture, lighting, or any specific requirements..."
                                value={roomData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="form-input-compact"
                                rows="3"
                                style={{ resize: 'vertical', minHeight: '80px' }}
                            />
                        </div>
                    </div>

                    {/* Room Images Upload Section */}
                    <div className="upload-section" >
                        <label className="form-label-compact">Room Images</label>
                        <div
                            className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${selectedImages.length > 0 ? 'has-images' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {selectedImages.length === 0 ? (
                                <div className="upload-prompt">
                                    <div className="upload-icon">🏠</div>
                                    <p className="upload-text">Drag & drop room images here</p>
                                    <p className="upload-subtext">Upload current room photos (optional)</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="file-input-hidden"
                                        id="room-image-upload"
                                    />
                                    <label htmlFor="room-image-upload" className="upload-button">
                                        Choose Images
                                    </label>
                                </div>
                            ) : (
                                <div className="image-grid">
                                    {selectedImages.map((file, index) => (
                                        <div key={index} className="image-item">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Room image ${index + 1}`}
                                                className="image-preview"
                                            />
                                            <div className="image-overlay">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="remove-btn"
                                                    title="Remove image"
                                                >
                                                    ×
                                                </button>
                                            </div>
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
                                                e.target.value = '';
                                            }}
                                            className="file-input-hidden"
                                            id="add-more-room-images"
                                        />
                                        <label htmlFor="add-more-room-images" className="add-more-label">
                                            <span className="add-icon">+</span>
                                            <span className="add-text">Add More</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Information Notice */}
                    <div className="primary-info" style={{ marginTop: '-15px', }}>
                        <span className="primary-label">
                            Tip: Upload current room photos to help your designer understand the space better
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-cancel-compact"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-submit-compact"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Room Details'}
                        </button>
                    </div>
                </form>
            </div>
            <AnimatePresence>
                {toastMessage && (
                    <Toast message={toastMessage} type={toastType} />
                )}
            </AnimatePresence>
        </div>
    );
}