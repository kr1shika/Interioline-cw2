// components/PaymentHistoryModal.jsx
import "./../style/EditProfileForm.css"; // Reuse your compact styles

export default function PaymentHistoryModal({ projectTitle, payments = [], totalPaid = 0, projectAmount = 0, onClose }) {
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

    return (
        <div className="edit-profile-overlay">
            <div className="edit-profile-container">
                <div className="profile-header">
                    <h2 style={{ color: "#A4502F" }}>Payment History: {projectTitle}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="edit-profile-form-compact">
                    {payments.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6b7280' }}>No payments recorded for this project.</p>
                    ) : (
                        <>
                            {payments.map((payment, index) => {
                                const label =
                                    payment.payment_type === "full" ? "Full Payment" :
                                        payment.payment_type === "initial" ? "Initial Payment (50%)" :
                                            payment.payment_type === "final" ? "Final Payment (50%)" :
                                                payment.payment_type;

                                return (
                                    <div key={index} className="preference-compact" style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {index + 1}. {label}
                                        </div>
                                        <div className="quiz-summary-compact">
                                            <div className="summary-chips">
                                                <span className="chip">Rs. {payment.amount.toLocaleString()}</span>
                                                <span className="chip">{formatDate(payment.payment_date)}</span>
                                                <span className="chip">{payment.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{ textAlign: 'right', fontWeight: 600, marginTop: '1rem' }}>
                                Total Paid: Rs. {totalPaid.toLocaleString()}
                                {projectAmount > totalPaid && (
                                    <>
                                        <br />
                                        Remaining: Rs. {(projectAmount - totalPaid).toLocaleString()}
                                    </>
                                )}
                            </div>

                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
