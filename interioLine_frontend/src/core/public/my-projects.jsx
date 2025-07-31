import axios from "axios";
import { useEffect, useState } from "react";
import { FiEdit, FiEye, FiMoreHorizontal, FiStar, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import bannerArt from "../../assets/images/art.png";
import profile from "../../assets/images/profile.jpg";
import room from "../../assets/images/room.png";
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
import Toast from "../../components/toastMessage.jsx";
import { useAuth } from "../../provider/authcontext";
import EditProfileForm from "../private/designer/EditProfileForm.jsx";
import "../style/myprj.css";
import { getRoomConfigurationByProjectId } from "./editingRoom/components/room-designer/furniture-Catalog";
import PaymentHistoryModal from "./PaymentHistoryModal.jsx";
import PaymentPage from "./PaymentPage.jsx";
export default function MyProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showPaymentPage, setShowPaymentPage] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [paymentType, setPaymentType] = useState('half');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyProject, setHistoryProject] = useState(null);


    const [dashboardStats, setDashboardStats] = useState({
        activeProjects: 0,
        totalClients: 0,
        revenueThisMonth: 0,
        averageRating: 0,
        totalReviews: 0,
    });

    const navigate = useNavigate();
    const { user, userRole, isLoggedIn, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!isLoggedIn) {
            console.log("🔒 Not authenticated, redirecting to home");
            navigate('/');
            return;
        }
        const fetchProjects = async () => {
            try {
                const res = await axios.get("https://localhost:2005/api/project/my", {
                    withCredentials: true
                });

                const fetched = Array.isArray(res.data) ? res.data : [];

                if (userRole === "designer") {
                    calculateDashboardStats(fetched);
                }

                return fetched;
            } catch (err) {
                console.error("❌ Error fetching projects:", err);
                setError("Failed to load projects.");
                return [];
            }
        };

        const fetchUserProfile = async () => {
            try {
                const res = await axios.get("https://localhost:2005/api/user/me", {
                    withCredentials: true
                });

                setUserProfile(res.data);
                console.log("✅ User profile loaded:", res.data.full_name);
            } catch (err) {
                console.error("❌ Error fetching user profile:", err);
                if (err.response?.status === 401) {
                    console.log("🔒 Unauthorized access to profile");
                }
            }
        };

        const fetchDesignerStats = async () => {
            try {
                const res = await axios.get("https://localhost:2005/api/project/designer/stats", { withCredentials: true });
                setDashboardStats(prev => ({
                    ...prev,
                    totalClients: res.data.totalClients || 0,
                    revenueThisMonth: res.data.revenueThisMonth || 0,
                    averageRating: res.data.averageRating || 4.5,
                    totalReviews: res.data.totalReviews || 0
                }));
            } catch (err) {
                console.error("❌ Error fetching designer stats:", err);
            }
        };

        const loadData = async () => {
            setLoading(true);
            const fetched = await fetchProjects();
            setProjects(fetched);
            if (userRole === "client") await fetchUserProfile();
            if (userRole === "designer") await fetchDesignerStats();
            setLoading(false);
        };

        loadData();
    }, [authLoading, isLoggedIn, userRole, navigate]);


    const calculateDashboardStats = (projectsData) => {
        const activeProjects = projectsData.filter(
            (project) => project.status !== "completed"
        ).length;

        const uniqueClients = new Set(projectsData.map(p => p.client)).size;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthRevenue = projectsData
            .filter(p => {
                const projectDate = new Date(p.createdAt);
                return projectDate.getMonth() === currentMonth &&
                    projectDate.getFullYear() === currentYear &&
                    p.status === 'completed';
            })
            .reduce((total, p) => total + (parseFloat(p.payment) || 0), 0);

        setDashboardStats(prev => ({
            ...prev,
            activeProjects,
            totalClients: uniqueClients,
            revenueThisMonth: thisMonthRevenue
        }));
    };


    const statusOptions = ["pending", "in_progress", "completed", "cancelled"];

    const updateProjectStatus = async (projectId, newStatus) => {
        try {
            await axios.patch(
                `https://localhost:2005/api/project/${projectId}/status`,
                { status: newStatus },
                { withCredentials: true } // ✅ secure cookie-based auth
            );

            // Update local state
            const updatedProjects = projects.map(project =>
                project._id === projectId
                    ? { ...project, status: newStatus }
                    : project
            );
            setProjects(updatedProjects);

            // Recalculate dashboard stats
            if (userRole === 'designer') {
                calculateDashboardStats(updatedProjects);
            }

            console.log("✅ Project status updated:", newStatus);
        } catch (err) {
            console.error("❌ Error updating project status:", err);

            if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError("Failed to update project status.");
            }
        }


    };


    const getStatusProgress = (status) => {
        const statusMap = {
            'pending': 20,
            'in_progress': 50,
            'completed': 100,
            'cancelled': 0
        };
        return statusMap[status] || 0;
    };

    const statusLabelMap = {
        "pending": "Pending",
        "in_progress": "In Progress",
        "completed": "Completed",
        "cancelled": "Cancelled"
    };

    const handleEditProfile = () => {
        setShowEditProfile(true);
    };

    const handleCloseEditProfile = () => {
        setShowEditProfile(false);
        // Refresh user profile to reflect changes
        if (userRole === 'client') {
            fetchUserProfile();
        }
    };
    const fetchUserProfile = async () => {
        try {
            const res = await axios.get("https://localhost:2005/api/user/me", {
                withCredentials: true,
            });
            setUserProfile(res.data);
        } catch (err) {
            console.error("❌ Error fetching user profile:", err);
        }
    };


    // Show toast message
    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    // Payment Functions
    const handlePaymentClick = (project) => {
        setSelectedProject(project);

        // Determine payment type based on project payment status
        if (project.payment === 'pending') {
            setPaymentType('half');
        } else if (project.payment === 'half-installment') {
            setPaymentType('final');
        }

        setShowPaymentPage(true);
    };

    const handlePaymentHistory = (project) => {
        setHistoryProject(project);
        setShowHistoryModal(true);
    };


    const handlePaymentSuccess = async (paymentData) => {
        console.log('💳 Payment successful:', paymentData);

        const updatedProjects = await fetchProjects();
        setProjects(updatedProjects);

        setShowPaymentPage(false);
        setSelectedProject(null);

        showToast(`Payment of Rs. ${paymentData.amount.toLocaleString()} completed successfully!`, "success");
    };


    const handleClosePayment = () => {
        setShowPaymentPage(false);
        setSelectedProject(null);
    };

    const calculatePaymentAmount = (project, type) => {
        const basePrice = 50000;
        let totalAmount = basePrice;

        if (project?.room_dimensions) {
            const area = (project.room_dimensions.length || 10) * (project.room_dimensions.width || 10);
            totalAmount += area * 500;
        }

        return type === 'half' || type === 'final' ? Math.round(totalAmount * 0.5) : totalAmount;
    };

    const canMakePayment = (project) => {
        if (project.status === 'completed') return false;

        const payments = project.payments || [];

        const hasFullPayment = payments.some(p => p.payment_type === 'full');
        if (hasFullPayment || payments.length >= 2) return false;

        return userRole === 'client' && project.status !== 'cancelled';
    };

    const shouldShowPaymentHistory = (project) => {
        const payments = project.payments || [];
        const hasFullPayment = payments.some(p => p.payment_type === 'full');
        return userRole === 'client' && (hasFullPayment || payments.length > 0);
    };

    const getPaymentStatusDisplay = (project) => {
        const payments = project.payments || [];

        const hasFullPayment = payments.some(p => p.payment_type === 'full');
        if (hasFullPayment) return '✅ Paid (Full)';

        if (payments.length >= 2) return '✅ Paid (Installments)';

        if (payments.length === 1 && payments[0].payment_type === 'half') {
            return '🔄 50% Paid';
        }

        return '⏳ Payment Pending';
    };


    // Get payment button text
    const getPaymentButtonText = (project) => {
        const payments = project.payments || [];

        if (payments.length === 0) return 'Pay half (50%)';
        if (payments.length === 1 && payments[0].payment_type === 'half') return 'Pay Final (50%)';

        return 'Pay Now';
    };

    // Modified function to handle edit/view button click
    const handleProjectAction = async (project) => {
        console.log("Project action clicked for:", project.title, "Status:", project.status);

        if (userRole === 'designer') {
            // Navigate to room editor with project data including status
            navigate('/room-edit', {
                state: {
                    projectId: project._id,
                    projectTitle: project.title,
                    projectStatus: project.status,
                    projectData: project
                }
            });
        } else {
            try {
                console.log("Checking for room configuration for project:", project._id);

                // Use the same function that CustomRoomDesigner uses
                const projectRoom = getRoomConfigurationByProjectId(project._id);

                console.log("Found project room:", projectRoom);

                if (projectRoom) {
                    console.log("Room found, navigating to view-only mode with status:", project.status);
                    navigate('/room-view', {
                        state: {
                            projectId: project._id,
                            projectTitle: project.title,
                            projectStatus: project.status, // Make sure status is passed
                            projectData: project
                        }
                    });
                } else {
                    console.log("No room found for project");
                    // Show toast if no room design is available
                    showToast("Room design is not available yet. Please wait for the designer to create it.", "warning");
                }
            } catch (error) {
                console.error("Error checking for room design:", error);
                showToast("Unable to check room availability. Please try again.", "error");
            }
        }
    };

    const activeProjects = projects.filter(project => project.status !== 'completed');
    const completedProjects = projects.filter(project => project.status === 'completed');

    if (authLoading) {
        return (
            <div className="my-projects-page">
                <Header />
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    fontSize: '16px',
                    color: '#C2805A'
                }}>
                    🔐 Verifying authentication...
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="my-projects-page">
                <Header />
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    fontSize: '16px'
                }}>
                    <h2 style={{ color: '#dc3545' }}>Error</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: '#C2805A',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '16px'
                        }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="my-projects-page">
            <Header onGetStartedClick={() => setShowAuth(true)} />

            {/* Toast Message */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                />
            )}

            <div className="page-content">
                {/* Designer Welcome Section */}
                {userRole === 'designer' && (
                    <div className="designer-welcome">
                        <h2>Welcome back, kir!</h2>
                        <p>Here's what's happening with your design projects</p>
                    </div>
                )}

                {/* Designer Dashboard Stats */}
                {userRole === 'designer' && (
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <FiEye />
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">{dashboardStats.activeProjects}</div>
                                <div className="stat-label">Active Projects</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <FiUsers />
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">{dashboardStats.totalClients}</div>
                                <div className="stat-label">Total Clients</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellow">
                                <FiStar />
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">{dashboardStats.averageRating.toFixed(1)}</div>
                                <div className="stat-label">Average Rating</div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Profile Section - Only for clients */}
                {userRole === 'client' && userProfile && (
                    <div className="profile-section">
                        <div className="profile-content">
                            <div className="profile-avatar">
                                <img
                                    src={userProfile.profilepic ? `https://localhost:2005${userProfile.profilepic}` : profile}
                                    alt="Profile"
                                    className="profile-image"
                                />
                            </div>
                            <div className="profile-info">
                                <h3 className="profile-name">{userProfile.full_name || 'Unknown User'}</h3>
                                <p className="profile-email">{userProfile.email || 'No email provided'}</p>
                            </div>
                            <div className="profile-actions">
                                <FiEdit
                                    onClick={handleEditProfile}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {/* Show banner only for clients */}
                {userRole === 'client' && (
                    <div className="start-banner">
                        <div className="banner-text">
                            <h3>Your dream interior is just a step away!</h3>
                            <p>Don't wait any longer to create the perfect space that reflects your style and personality.</p>
                            <button className="start-btn" onClick={() => navigate("/search")}>
                                Start New Project
                            </button>
                        </div>
                        <img src={bannerArt} alt="banner art" />
                    </div>
                )}
                {/* Active Projects Section */}
                {activeProjects.length > 0 && (
                    <>
                        <h3 className="section-heading">
                            {userRole === 'designer' ? 'Your Projects' : 'Ongoing Projects'}
                        </h3>

                        {loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: '#C2805A'
                            }}>
                                Loading projects...
                            </div>
                        ) : (
                            <div className="active-projects-container">
                                {activeProjects.map((project) => (
                                    <div className="active-project-card" key={project._id}>
                                        <div className="active-project-header">
                                            <div className="active-project-icon">
                                                <img src={room} alt="project icon" />
                                            </div>
                                            <div className="active-project-info">
                                                <h4 className="active-project-title">{project.title}</h4>
                                                <p className="active-project-client">
                                                    {userRole === 'designer' ?
                                                        `client: ${project.client_name || 'Unknown Client'}` :
                                                        `designer: ${project.designer_name || 'Unknown Designer'}`
                                                    }
                                                </p>
                                            </div>
                                            <div className="active-project-status">
                                                {userRole === 'designer' ? (
                                                    <select
                                                        value={project.status}
                                                        onChange={(e) => updateProjectStatus(project._id, e.target.value)}
                                                        className="active-status-dropdown"
                                                    >
                                                        {statusOptions.map(status => (
                                                            <option key={status} value={status}>
                                                                {statusLabelMap[status]}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`status-badge ${project.status}`}>
                                                        {statusLabelMap[project.status]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="active-project-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${getStatusProgress(project.status)}%` }}
                                                ></div>
                                            </div>
                                            <span className="progress-text">
                                                {getStatusProgress(project.status)}%
                                            </span>
                                        </div>

                                        <div className="active-project-footer">
                                            <div className="active-project-date">
                                                <span>Due date:</span>
                                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="active-project-actions">
                                                <button
                                                    className="active-action-btn view-btn"
                                                    onClick={() => handleProjectAction(project)}
                                                >
                                                    {userRole === 'designer' ? 'Edit' : 'View'}
                                                </button>

                                                {/* Payment Button - Only for clients on unpaid projects */}
                                                {canMakePayment(project) && (
                                                    <button
                                                        className="active-action-btn pay-btn"
                                                        onClick={() => handlePaymentClick(project)}
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                                {shouldShowPaymentHistory(project) && (
                                                    <button
                                                        className="active-action-btn pay-btn"
                                                        style={{ backgroundColor: "#F3F4F6", color: "#374635", border: "1px solid #e5e7eb" }}
                                                        onClick={() => handlePaymentHistory(project)}
                                                    >
                                                        History
                                                    </button>
                                                )}


                                                {/* {showHistoryModal && historyProject && (
                                                    <PaymentHistoryModal
                                                        projectTitle={historyProject.title}
                                                        payments={historyProject.payments}
                                                        totalPaid={historyProject.totalPaid}
                                                        projectAmount={historyProject.amount}
                                                        onClose={() => setShowHistoryModal(false)}
                                                    />
                                                )} */}

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Past Projects Section */}
                {completedProjects.length > 0 && (
                    <>
                        <h3 className="section-heading past-projects-headingg">
                            Past Projects
                        </h3>

                        <div className="past-projects-grid">
                            {completedProjects.map((project) => (
                                <div className="past-project-card" key={project._id}>
                                    <div className="past-project-header">
                                        <div className="past-project-icon">
                                            <img src={room} alt="project icon" />
                                        </div>
                                        <div className="past-project-header-info">
                                            <h4 className="past-project-title">{project.title}</h4>
                                            <p className="past-project-client">
                                                {userRole === 'designer' ?
                                                    `client: ${project.client_name || 'Unknown Client'}` :
                                                    `designer: ${project.designer_name || 'Unknown Designer'}`
                                                }
                                            </p>
                                        </div>
                                        <div className="past-project-menu">
                                            <FiMoreHorizontal />
                                        </div>
                                    </div>

                                    <div className="past-project-content">
                                        <div className="past-project-status">
                                            <span className="completed-badge">Completed</span>
                                        </div>
                                    </div>

                                    <div className="past-project-footer">
                                        <div className="past-project-date">
                                            <span>Due date:</span>
                                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="past-project-actions">
                                            <button
                                                className="past-project-view-btn"
                                                onClick={() => handleProjectAction(project)}
                                            >
                                                <FiEye />
                                            </button>


                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Show message when no projects exist */}
                {!loading && projects.length === 0 && (
                    <div className="no-projects">
                        <p>No projects found. {userRole === 'client' ? 'Start your first project!' : 'You haven\'t been assigned any projects yet.'}</p>
                    </div>
                )}

                {/* Show message when no active projects but have completed ones */}
                {!loading && activeProjects.length === 0 && completedProjects.length > 0 && (
                    <div className="no-active-projects">
                        <p>No active projects. {userRole === 'client' ? 'Start a new project!' : 'No active projects assigned.'}</p>
                    </div>
                )}
            </div>

            {/* Edit Profile Popup */}
            {showEditProfile && userProfile && (
                <div className="edit-profile-overlay">
                    <EditProfileForm
                        designer={userProfile}
                        onClose={handleCloseEditProfile}
                    />
                </div>
            )}

            {showPaymentPage && selectedProject && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1000
                    }}>

                    <PaymentPage
                        projectId={selectedProject._id}
                        amount={selectedProject.amount}
                        totalPaid={selectedProject.totalPaid}
                        hasPaidHalf={selectedProject.payments?.some(p => p.payment_type === "half")}
                        hasPaidFull={selectedProject.payments?.some(p => p.payment_type === "full")}
                        isFullyPaid={selectedProject.totalPaid >= selectedProject.amount}
                        paymentType={paymentType}
                        onSuccess={handlePaymentSuccess}
                        onClose={handleClosePayment}
                        project={selectedProject}
                    />
                </div>
            )}


            {showHistoryModal && historyProject && (
                <PaymentHistoryModal
                    projectTitle={historyProject.title}
                    payments={historyProject.payments}
                    totalPaid={historyProject.totalPaid}
                    projectAmount={historyProject.amount}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}
            <Footer />
        </div>
    );
}