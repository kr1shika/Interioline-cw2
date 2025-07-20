import axios from 'axios';
import { useEffect, useState } from 'react';

const PaymentPage = ({ projectId, amount, paymentType, onSuccess, onClose, userId, project }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [selectedPaymentType, setSelectedPaymentType] = useState('half');
    const [projectData, setProjectData] = useState(project || null);
    const [designerData, setDesignerData] = useState(null);
    const [clientData, setClientData] = useState(null);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        // Auto-fill demo card data
        setCardData({
            cardNumber: '4242 4242 4242 4242',
            expiryDate: '12/28',
            cvv: '123',
            cardholderName: 'John Doe',
            email: 'client@example.com',
            phone: '+977-9800000000'
        });

        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            const currentProject = projectData || project;

            // Fetch designer details
            if (currentProject?.designer) {
                try {
                    const designerRes = await axios.get(`http://localhost:2005/api/user/${currentProject.designer}`);
                    setDesignerData(designerRes.data);
                } catch (err) {
                    console.log('Designer data not found');
                }
            }

            // Fetch client details
            if (currentProject?.client) {
                try {
                    const clientRes = await axios.get(`http://localhost:2005/api/user/${currentProject.client}`);
                    setClientData(clientRes.data);
                } catch (err) {
                    console.log('Client data not found');
                }
            }
        } catch (err) {
            console.error('Error fetching project details:', err);
        }
    };

    const calculateAmount = () => {
        const basePrice = 10000;
        let totalAmount = basePrice;

        const currentProject = projectData || project;
        if (currentProject?.room_dimensions) {
            const area = (currentProject.room_dimensions.length || 10) * (currentProject.room_dimensions.width || 10);
            totalAmount += area * 500;
        }

        if (selectedPaymentType === 'full') {
            return Math.round(totalAmount * 0.95); // 5% discount
        } else if (selectedPaymentType === 'half') {
            return Math.round(totalAmount * 0.5); // 50% payment
        }
        return totalAmount;
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const match = v.match(/\d{4,16}/g)?.[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleInputChange = (field, value) => {
        let formattedValue = value;

        if (field === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (field === 'expiryDate') {
            formattedValue = formatExpiryDate(value);
        } else if (field === 'cvv') {
            formattedValue = value.replace(/[^0-9]/g, '').substring(0, 3);
        } else if (field === 'phone') {
            formattedValue = value.replace(/[^0-9+\-]/g, '');
        }

        setCardData(prev => ({
            ...prev,
            [field]: formattedValue
        }));
    };

    const validateForm = () => {
        if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
            setError('Please enter a valid 16-digit card number');
            return false;
        }
        if (cardData.expiryDate.length !== 5) {
            setError('Please enter a valid expiry date (MM/YY)');
            return false;
        }
        if (cardData.cvv.length !== 3) {
            setError('Please enter a valid 3-digit CVV');
            return false;
        }
        if (!cardData.cardholderName.trim()) {
            setError('Please enter the cardholder name');
            return false;
        }
        if (!cardData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        const finalAmount = calculateAmount();

        setTimeout(async () => {
            try {
                const response = await axios.post(
                    `http://localhost:2005/api/payment/create`,
                    {
                        amount: finalAmount,
                        projectId: projectId,
                        paymentType: selectedPaymentType,
                        userId: userId
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    setSuccess(true);
                    setLoading(false);

                    setTimeout(() => {
                        if (onSuccess) {
                            onSuccess({
                                ...response.data.payment,
                                amount: finalAmount
                            });
                        }
                    }, 2000);
                } else {
                    setError(response.data.message || 'Payment failed');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Payment error:', err);
                setError(err.response?.data?.message || 'Payment failed');
                setLoading(false);
            }
        }, 2000);
    };

    const currentProject = projectData || project;

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <div style={styles.successIcon}>✓</div>
                    <h2 style={styles.successTitle}>Payment Successful!</h2>
                    <p style={styles.successMessage}>
                        Your payment of Rs. {calculateAmount().toLocaleString()} has been processed successfully.
                    </p>
                    <div style={styles.successDetails}>
                        <p>Payment Type: {selectedPaymentType === 'half' ? 'Half Payment (50%)' : 'Full Payment'}</p>
                        <p>Project: {currentProject?.title}</p>
                        <p>Transaction will appear on your statement.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.paymentWrapper}>
                {/* LEFT SIDE - BILL/INFO SECTION */}
                <div style={styles.leftSection}>
                    {/* Invoice Header */}
                    <div style={styles.invoiceHeader}>
                        <h2 style={styles.invoiceTitle}>Invoice</h2>
                        {/* <div style={styles.invoiceNumber}>
                            #{projectId?.slice(-6).toUpperCase() || 'INV001'}
                        </div> */}
                    </div>

                    {/* Project Details */}
                    <div style={styles.infoCard}>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Project Name:</span>
                            <span style={styles.infoValue}>{currentProject?.title || 'Loading...'}</span>
                        </div>

                        <div style={styles.infoRow} >
                            <span style={styles.infoLabel}>Status:</span>
                            <span style={{ ...styles.infoValue, ...styles.statusBadge }}>
                                {currentProject?.status || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Designer and Client Info Side by Side */}
                    <div style={styles.sideBySideContainer}>
                        {/* Designer Info */}
                        <div style={styles.infoCard}>
                            <h3 style={styles.cardTitle}>Designer </h3>
                            <div style={styles.personCard}>
                                <div style={styles.avatar}>
                                    {designerData?.profilepic ? (
                                        <img
                                            src={`http://localhost:2005${designerData.profilepic}`}
                                            alt="Designer"
                                            style={styles.avatarImg}
                                        />
                                    ) : (
                                        <div style={styles.avatarPlaceholder}>
                                            {designerData?.full_name?.charAt(0) || 'D'}
                                        </div>
                                    )}
                                </div>
                                <div style={styles.personInfo}>
                                    <div style={styles.personName}>
                                        {designerData?.full_name || 'Loading...'}
                                    </div>
                                    <div style={styles.personEmail}>
                                        {designerData?.email || ''}
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div style={styles.infoCard}>
                            <h3 style={styles.cardTitle}>Bill To</h3>
                            <div style={styles.personCard}>
                                <div style={styles.avatar}>
                                    {clientData?.profilepic ? (
                                        <img
                                            src={`http://localhost:2005${clientData.profilepic}`}
                                            alt="Client"
                                            style={styles.avatarImg}
                                        />
                                    ) : (
                                        <div style={styles.avatarPlaceholder}>
                                            {clientData?.full_name?.charAt(0) || 'C'}
                                        </div>
                                    )}
                                </div>
                                <div style={styles.personInfo}>
                                    <div style={styles.personName}>
                                        {clientData?.full_name || 'Loading...'}
                                    </div>
                                    <div style={styles.personEmail}>
                                        {clientData?.email || ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Options */}
                    <div style={styles.infoCard}>
                        <h3 style={styles.cardTitle}>Payment Options</h3>
                        <div style={styles.paymentOptions}>
                            <div
                                style={{
                                    ...styles.paymentOption,
                                    ...(selectedPaymentType === 'half' ? styles.paymentOptionActive : {})
                                }}
                                onClick={() => setSelectedPaymentType('half')}
                            >
                                <div style={styles.optionHeader}>
                                    <input
                                        type="radio"
                                        checked={selectedPaymentType === 'half'}
                                        onChange={() => setSelectedPaymentType('half')}
                                        style={styles.radioInput}
                                    />
                                    <span style={styles.optionTitle}>Half Payment (50%)</span>
                                </div>
                                <div style={styles.optionAmount}>
                                    Rs. {Math.round((10000 + (currentProject?.room_dimensions ?
                                        (currentProject.room_dimensions.length || 10) * (currentProject.room_dimensions.width || 10) * 500 : 0)) * 0.5).toLocaleString()}
                                </div>
                                <div style={styles.optionDescription}>
                                    Pay 50% now to start the project
                                </div>
                            </div>

                            <div
                                style={{
                                    ...styles.paymentOption,
                                    ...(selectedPaymentType === 'full' ? styles.paymentOptionActive : {})
                                }}
                                onClick={() => setSelectedPaymentType('full')}
                            >
                                <div style={styles.optionHeader}>
                                    <input
                                        type="radio"
                                        checked={selectedPaymentType === 'full'}
                                        onChange={() => setSelectedPaymentType('full')}
                                        style={styles.radioInput}
                                    />
                                    <span style={styles.optionTitle}>Full Payment</span>
                                </div>
                                <div style={styles.optionAmount}>
                                    Rs. {Math.round((10000 + (currentProject?.room_dimensions ?
                                        (currentProject.room_dimensions.length || 10) * (currentProject.room_dimensions.width || 10) * 500 : 0)) * 0.95).toLocaleString()}
                                </div>
                                <div style={styles.optionDescription}>
                                    Pay full amount upfront (5% discount applied)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div style={styles.totalCard}>
                        <div style={styles.totalRow}>
                            <span>Subtotal:</span>
                            <span>Rs. {calculateAmount().toLocaleString()}</span>
                        </div>
                        <div style={styles.totalRow}>
                            <span>Processing Fee:</span>
                            <span>Rs. 0</span>
                        </div>
                        {selectedPaymentType === 'full' && (
                            <div style={styles.totalRow}>
                                <span style={{ color: '#10b981' }}>Discount (5%):</span>
                                <span style={{ color: '#10b981' }}>- Rs. {Math.round((50000 + (currentProject?.room_dimensions ?
                                    (currentProject.room_dimensions.length || 10) * (currentProject.room_dimensions.width || 10) * 500 : 0)) * 0.05).toLocaleString()}</span>
                            </div>
                        )}
                        <div style={styles.totalRowFinal}>
                            <span>Total Amount:</span>
                            <span>Rs. {calculateAmount().toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - PAYMENT FORM */}
                <div style={styles.rightSection}>
                    <div style={styles.paymentCard}>
                        {/* Header */}
                        <div style={styles.header}>
                            <div style={styles.headerLeft}>
                                <div style={styles.stripeLogo}>stripe</div>
                                <div style={styles.paymentAmount}>Rs. {calculateAmount().toLocaleString()}</div>
                            </div>
                            {onClose && (
                                <button onClick={onClose} style={styles.closeButton}>×</button>
                            )}
                        </div>

                        {/* Payment Form */}
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Email Address *</label>
                                <input
                                    type="email"
                                    value={cardData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    style={styles.input}
                                    required
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={cardData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    style={styles.input}
                                    placeholder="+977-9800000000"
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Card Information *</label>
                                <input
                                    type="text"
                                    placeholder="1234 1234 1234 1234"
                                    value={cardData.cardNumber}
                                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                                    style={styles.input}
                                    maxLength="19"
                                    required
                                />
                                <div style={styles.cardRow}>
                                    <input
                                        type="text"
                                        placeholder="MM / YY"
                                        value={cardData.expiryDate}
                                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                        style={{ ...styles.input, ...styles.halfInput }}
                                        maxLength="5"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVC"
                                        value={cardData.cvv}
                                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                                        style={{ ...styles.input, ...styles.halfInput }}
                                        maxLength="3"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Cardholder Name *</label>
                                <input
                                    type="text"
                                    placeholder="Full name on card"
                                    value={cardData.cardholderName}
                                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            {error && (
                                <div style={styles.error}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.payButton,
                                    backgroundColor: loading ? '#ccc' : '#A75B2A',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <div style={styles.loadingContainer}>
                                        <div style={styles.spinner}></div>
                                        Processing...
                                    </div>
                                ) : (
                                    `Pay Rs. ${calculateAmount().toLocaleString()}`
                                )}
                            </button>

                            <div style={styles.secureText}>
                                🔒 Your payment information is secure and encrypted
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    // CONTAINER
    container: {
        minHeight: '100vh',
        backgroundColor: '#FFFFF6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px'
    },
    paymentWrapper: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        maxWidth: '1400px',
        margin: '0 auto'
    },

    // LEFT SECTION
    leftSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    invoiceHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0px'
    },
    invoiceTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#A75B2A',
        margin: 0
    },
    invoiceNumber: {
        fontSize: '14px',
        color: '#666',
        fontWeight: '500',
        backgroundColor: '#FFFF6',
        padding: '4px 8px',
        borderRadius: '4px'
    },

    sideBySideContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },

    infoCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '10px 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e6ebf1'
    },
    cardTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '10px',
        margin: '0 0 16px 0'
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
        fontSize: '14px'
    },
    infoLabel: {
        color: '#666',
        fontWeight: '500'
    },
    infoValue: {
        color: '#1a1a1a',
        fontWeight: '600'
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        backgroundColor: '#e3f2fd',
        color: '#1976d2'
    },
    personCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#635bff',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '600'
    },
    personInfo: {
        flex: 1
    },
    personName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '4px'
    },
    personEmail: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '2px'
    },
    personDetail: {
        fontSize: '12px',
        color: '#888',
        marginBottom: '2px'
    },
    paymentOptions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    paymentOption: {
        border: '2px solid #e6ebf1',
        borderRadius: '8px',
        padding: '13px 16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    paymentOptionActive: {
        borderColor: '#635bff',
        backgroundColor: '#f8f9ff'
    },
    optionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
    },
    radioInput: {
        margin: 0
    },
    optionTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1a1a1a'
    },
    optionAmount: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '4px'
    },
    optionDescription: {
        fontSize: '12px',
        color: '#666'
    },
    totalCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e6ebf1'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        fontSize: '14px',
        color: '#666'
    },
    totalRowFinal: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a1a1a',
        borderTop: '1px solid #e6ebf1',
        paddingTop: '12px',
        marginTop: '12px'
    },

    // RIGHT SECTION
    rightSection: {
        display: 'flex',
        flexDirection: 'column'
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e6ebf1',
        position: 'sticky',
        top: '20px',
        height: 'fit-content'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    stripeLogo: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#A75B2A',
        fontFamily: 'arial, sans-serif'
    },
    paymentAmount: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#32325d'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        color: '#87bbfd',
        cursor: 'pointer',
        padding: '0',
        width: '30px',
        height: '30px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#32325d',
        marginBottom: '6px'
    },
    input: {
        padding: '12px 16px',
        border: '1px solid #cdd5df',
        borderRadius: '6px',
        fontSize: '16px',
        color: '#32325d',
        backgroundColor: 'white',
        transition: 'border-color 0.15s ease',
        outline: 'none'
    },
    cardRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '1px'
    },
    halfInput: {
        margin: 0
    },
    error: {
        color: '#fa755a',
        fontSize: '14px',
        backgroundColor: '#fff5f5',
        border: '1px solid #fed7d7',
        borderRadius: '6px',
        padding: '12px 16px'
    },
    payButton: {
        backgroundColor: '#A75B2A',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        marginTop: '12px'
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid #ffffff40',
        borderTop: '2px solid #ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    secureText: {
        fontSize: '12px',
        color: '#87bbfd',
        textAlign: 'center',
        marginTop: '16px'
    },

    // SUCCESS
    successCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px 32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        margin: '0 auto'
    },
    successIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#00d924',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 auto 24px'
    },
    successTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#32325d',
        marginBottom: '16px'
    },
    successMessage: {
        fontSize: '16px',
        color: '#525f7f',
        marginBottom: '24px'
    },
    successDetails: {
        fontSize: '14px',
        color: '#87bbfd',
        lineHeight: '1.5'
    }
};

// Add CSS for animations and responsive design
const styleElement = document.createElement('style');
styleElement.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 1024px) {
        .payment-wrapper {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
        }
        
        .side-by-side-container {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
        }
    }
    
    @media (max-width: 768px) {
        .side-by-side-container {
            grid-template-columns: 1fr !important;
        }
    }
`;
if (!document.head.querySelector('style[data-payment-styles]')) {
    styleElement.setAttribute('data-payment-styles', 'true');
    document.head.appendChild(styleElement);
}

export default PaymentPage;