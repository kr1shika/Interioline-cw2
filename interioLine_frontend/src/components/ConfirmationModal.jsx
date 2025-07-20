// Create a new file: components/ConfirmationModal.jsx

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Delete",
    cancelText = "Cancel",
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal" style={
                { backgroundColor: '#FFFFF6', border: '1px solid #A75B2A', borderRadius: '8px', color: '#A75B2A' }
            }>
                <div className="confirmation-modal-header" >
                    <h3 style={{ color: '#A75B2A' }}>{title}</h3>
                </div>

                <div className="confirmation-modal-body">
                    <p style={{ color: '#A75B2A' }}>{message}</p>
                </div>

                <div className="confirmation-modal-footer">
                    <button
                        className="confirm-cancel-btn"
                        onClick={onClose}
                        disabled={isLoading}
                        style={{ border: '1px solid #A75B2A', color: '#A75B2A' }}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="confirm-delete-btn"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;