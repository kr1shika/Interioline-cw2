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
                { backgroundColor: '#FFFFF6', border: '1px solid #4D5A4A', borderRadius: '8px', color: '#4D5A4A' }
            }>
                <div className="confirmation-modal-header" >
                    <h3 style={{ color: '#4D5A4A' }}>{title}</h3>
                </div>

                <div className="confirmation-modal-body">
                    <p style={{ color: '#4D5A4A' }}>{message}</p>
                </div>

                <div className="confirmation-modal-footer">
                    <button
                        className="confirm-cancel-btn"
                        onClick={onClose}
                        disabled={isLoading}
                        style={{ border: '1px solid #4D5A4A', color: '#4D5A4A' }}
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