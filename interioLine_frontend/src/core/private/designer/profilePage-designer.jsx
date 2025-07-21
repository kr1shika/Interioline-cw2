import axios from "axios";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddPortfolioModal from "../../../components/addPost.jsx";
import ConfirmationModal from "../../../components/ConfirmationModal.jsx"; // Add this import
import Footer from "../../../components/footer.jsx";
import Header from "../../../components/header.jsx";
import PortfolioPostViewer from "../../../components/PortfolioPostViewer.jsx";
import { useAuth } from "../../../provider/authcontext";
import "../../style/profile.css";
import EditProfileForm from "./EditProfileForm.jsx";

export default function ProfilePage() {
    const [designer, setDesigner] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [portfolioPosts, setPortfolioPosts] = useState([]);
    const [activePost, setActivePost] = useState(null);
    const [error, setError] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Add delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { isLoggedIn, userId, userRole, loading, isUserIdAvailable, getToken } = useAuth();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);

    const fetchReviews = async () => {
        try {
            const token = getToken();
            const config = {
                ...(token && {
                    headers: { Authorization: `Bearer ${token}` }
                })
            };

            const res = await axios.get(`https://localhost:2005/api/review/designer/${userId}`, config);
            setReviews(res.data.reviews || []);
            setAverageRating(res.data.averageRating || 0);
            console.log("✅ Reviews loaded:", res.data.reviews?.length || 0);
        } catch (err) {
            console.error("❌ Error fetching reviews:", err);
        }
    };




    useEffect(() => {
        // Wait for auth to finish loading
        if (loading) return;

        if (!isLoggedIn) {
            console.log(" Not logged in, redirecting to home");
            navigate('/');
            return;
        }

        if (!isUserIdAvailable()) {
            setError('Authentication error. Unable to access user information.');
            setLoadingProfile(false);
            return;
        }

        // Optional: Check if user has designer role
        if (userRole && userRole !== 'designer') {
            setError('Access denied. Designer account required.');
            setLoadingProfile(false);
            return;
        }

        // Fetch data functions
        const fetchDesigner = async () => {
            try {
                const token = getToken();
                const config = {
                    ...(token && {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                };

                const res = await axios.get(`https://localhost:2005/api/user/${userId}`, config);
                setDesigner(res.data);
                console.log("✅ Designer profile loaded:", res.data.full_name);
            } catch (err) {
                console.error("❌ Error fetching designer profile:", err);

                if (err.response?.status === 401) {
                    setError('Session expired. Please log in again.');
                } else if (err.response?.status === 403) {
                    setError('Access denied. You can only view your own profile.');
                } else {
                    setError('Failed to load profile. Please try again.');
                }
            } finally {
                setLoadingProfile(false);
            }
        };

        const fetchPortfolioPosts = async () => {
            try {
                const token = getToken();
                const config = {
                    ...(token && {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                };

                const res = await axios.get(`https://localhost:2005/api/portfolio/posts/${userId}`, config);
                setPortfolioPosts(res.data.posts || []);
                console.log("✅ Portfolio posts loaded:", res.data.posts?.length || 0);
            } catch (err) {
                console.error("❌ Error fetching portfolio posts:", err);

                if (err.response?.status === 401) {
                    console.log("🔒 Unauthorized access to portfolio");
                } else {
                    console.log("⚠️ Portfolio posts unavailable");
                }
            }
        };

        // Load data
        fetchDesigner();
        fetchPortfolioPosts();
        fetchReviews();

    }, [userId, isLoggedIn, userRole, loading, navigate, showAddForm, isUserIdAvailable, getToken]);

    // Handle profile update callback
    const handleProfileUpdate = async () => {
        if (!isUserIdAvailable()) return;

        try {
            const token = getToken();
            const config = {
                ...(token && {
                    headers: { Authorization: `Bearer ${token}` }
                })
            };

            const res = await axios.get(`https://localhost:2005/api/user/${userId}`, config);
            setDesigner(res.data);
            console.log("✅ Profile refreshed after update");
        } catch (err) {
            console.error("❌ Error refreshing profile:", err);
        }
    };

    // Handle delete post
    const handleDeletePost = async (postId) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        try {
            const token = getToken();
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.delete(`https://localhost:2005/api/portfolio/posts/${postToDelete}`, config);

            setPortfolioPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete));

            console.log("✅ Portfolio post deleted successfully");
            setShowDeleteModal(false);
            setPostToDelete(null);
        } catch (err) {
            console.error("❌ Error deleting portfolio post:", err);

            if (err.response?.status === 401) {
                setError('Session expired. Please log in again.');
            } else if (err.response?.status === 403) {
                setError('You can only delete your own posts.');
            } else {
                setError('Failed to delete post. Please try again.');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDeletePost = () => {
        setShowDeleteModal(false);
        setPostToDelete(null);
    };

    // Show loading while auth is being determined
    if (loading) {
        return (
            <div className="profile-page">
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

    // Show error if access denied or other errors
    if (error) {
        return (
            <div className="profile-page">
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

    // Show loading while profile data is being fetched
    if (loadingProfile || !designer) {
        return (
            <div className="profile-page">
                <Header onGetStartedClick={() => setIsEditing(true)} />
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    fontSize: '16px',
                    color: '#C2805A'
                }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Header onGetStartedClick={() => setIsEditing(true)} />

            <div className={`profile-container ${isEditing ? "blur-disabled" : ""}`}>
                {/* Profile Card */}
                <div className="profile-card">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="edit-button"
                    >
                        Edit
                    </button>

                    <div className="profile-card-content">
                        <img
                            src={
                                designer.profilepic
                                    ? `https://localhost:2005${designer.profilepic}`
                                    : "/assets/default-avatar.png"
                            }
                            alt={designer.full_name}
                            className="profile-image"
                        />

                        <div className="profile-content">
                            <div className="profile-info">
                                <h1>{designer.full_name}</h1>
                                <p className="location">Kathmandu, Nepal</p>
                                <p className="bio">{designer.bio}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portfolio Section */}
                <section className="portfolio-section">
                    <div className="section-header">
                        <h2>Portfolio</h2>
                        <button onClick={() => setShowAddForm(true)} className="add-post-button">
                            + Add Post
                        </button>
                    </div>

                    <div className="portfolio-grid">
                        {portfolioPosts.length === 0 ? (
                            <div className="no-posts">
                                No portfolio posts yet. Add your first project!
                            </div>
                        ) : (
                            portfolioPosts.map((post) => {
                                const primaryImage =
                                    post.images.find((img) => img.is_primary) || post.images[0];
                                if (!primaryImage) return null;

                                return (
                                    <div
                                        key={post._id}
                                        className="portfolio-post"
                                        onClick={() => setActivePost(post)}
                                    >
                                        <img
                                            src={`https://localhost:2005${primaryImage.url}`}
                                            alt={primaryImage.caption || post.title}
                                        />
                                        <div className="post-overlay">
                                            <span className="post-title">{post.title}</span>
                                            <FaTrashAlt
                                                className="trash-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePost(post._id);
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className="reviews-section">
                    <div className="section-header">
                        <h2>Reviews</h2>
                    </div>
                    <div className="reviews-grid">
                        {reviews.length === 0 ? (
                            <div className="no-posts">No reviews yet.</div>
                        ) : (
                            reviews.map((review, index) => (
                                <div key={index} className="review-card">
                                    <img
                                        src={
                                            review.client?.profilepic
                                                ? `https://localhost:2005${review.client.profilepic}`
                                                : "/assets/default-avatar.png"
                                        }
                                        alt={review.client?.full_name || "Anonymous"}
                                    />
                                    <strong>{review.client?.full_name || "Anonymous"}</strong>
                                    {/* <small>Happy Client</small> */}
                                    <p>"{review.comment}"</p>
                                    <div className="review-stars">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="modal-overlay">
                    <EditProfileForm
                        designer={designer}
                        onClose={() => {
                            setIsEditing(false);
                            handleProfileUpdate();
                        }}
                    />
                </div>
            )}

            {/* Add Portfolio Modal */}
            {showAddForm && (
                <AddPortfolioModal onClose={() => setShowAddForm(false)} />
            )}

            {/* Portfolio Post Viewer Modal */}
            {activePost && (
                <PortfolioPostViewer post={activePost} onClose={() => setActivePost(null)} />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={cancelDeletePost}
                onConfirm={confirmDeletePost}
                title="Delete Portfolio Post"
                message="Are you sure you want to delete this portfolio post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
            />
            <Footer />

        </div>
    );
}