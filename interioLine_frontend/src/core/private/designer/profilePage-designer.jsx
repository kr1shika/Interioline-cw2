import axios from "axios";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddPortfolioModal from "../../../components/addPost.jsx";
import ConfirmationModal from "../../../components/ConfirmationModal.jsx";
import Footer from "../../../components/footer.jsx";
import Header from "../../../components/header.jsx";
import PortfolioPostViewer from "../../../components/PortfolioPostViewer.jsx";
import { useAuth } from "../../../provider/authcontext";
import { getCsrfToken } from "../../provider/csrf";
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const { isLoggedIn, userRole, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            console.log("Not logged in, redirecting to home");
            navigate('/');
            return;
        }

        if (userRole !== 'designer') {
            setError('Access denied. Designer account required.');
            setLoadingProfile(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await axios.get("https://localhost:2005/api/user/me", {
                    withCredentials: true,
                });
                setDesigner(res.data);
            } catch (err) {
                console.error("❌ Error fetching profile:", err);
                setError("Failed to load profile.");
            }
        };

        const fetchPortfolioPosts = async () => {
            try {
                const res = await axios.get("https://localhost:2005/api/portfolio/my", {
                    withCredentials: true,
                });
                setPortfolioPosts(res.data || []);
            } catch (err) {
                console.error("❌ Error fetching portfolio posts:", err);
            }
        };


        const loadData = async () => {
            setLoadingProfile(true); // not setLoading!
            await fetchProfile();
            await fetchPortfolioPosts();
            setLoadingProfile(false);
        };


        loadData();
    }, [authLoading, isLoggedIn, userRole, navigate]);

    const handleProfileUpdate = async () => {
        try {
            const res = await axios.get("https://localhost:2005/api/user/me", {
                withCredentials: true,
            });
            setDesigner(res.data);
            setIsEditing(false);
            console.log("✅ Profile updated");
        } catch (err) {
            console.error("❌ Error refreshing profile:", err);
        }
    };

    const handleDeletePost = async (postId) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        try {
            const csrfToken = await getCsrfToken();

            await axios.delete(`https://localhost:2005/api/portfolio/posts/${postToDelete}`, {
                withCredentials: true,

                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken
                },

            });

            setPortfolioPosts(prev => prev.filter(p => p._id !== postToDelete));
            console.log("✅ Portfolio post deleted");
            setShowDeleteModal(false);
            setPostToDelete(null);
        } catch (err) {
            console.error("❌ Error deleting post:", err);
            setError("Failed to delete post.");
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDeletePost = () => {
        setShowDeleteModal(false);
        setPostToDelete(null);
    };

    if (authLoading) {
        return (
            <div className="profile-page">
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '16px', color: '#C2805A' }}>
                    🔐 Verifying authentication...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <Header />
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px' }}>
                    <h2 style={{ color: '#dc3545' }}>Error</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: '#C2805A', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '16px' }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (loadingProfile || !designer) {
        return (
            <div className="profile-page">
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '16px', color: '#C2805A' }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Header onGetStartedClick={() => setIsEditing(true)} />
            <div className={`profile-container ${isEditing ? "blur-disabled" : ""}`}>
                <div className="profile-card">
                    <button onClick={() => setIsEditing(true)} className="edit-button">Edit</button>
                    <div className="profile-card-content">
                        <img
                            src={designer.profilepic ? `https://localhost:2005${designer.profilepic}` : "/assets/default-avatar.png"}
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

                <section className="portfolio-section">
                    <div className="section-header">
                        <h2>Portfolio</h2>
                        <button onClick={() => setShowAddForm(true)} className="add-post-button">+ Add Post</button>
                    </div>
                    <div className="portfolio-grid">
                        {portfolioPosts.length === 0 ? (
                            <div className="no-posts">No portfolio posts yet. Add your first project!</div>
                        ) : (
                            portfolioPosts.map((post) => {
                                const primaryImage = post.images.find((img) => img.is_primary) || post.images[0];
                                if (!primaryImage) return null;
                                return (
                                    <div key={post._id} className="portfolio-post" onClick={() => setActivePost(post)}>
                                        <img src={`https://localhost:2005${primaryImage.url}`} alt={primaryImage.caption || post.title} />
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

            </div>

            {
                isEditing && (
                    <div className="modal-overlay">
                        <EditProfileForm
                            designer={designer}
                            onClose={() => {
                                setIsEditing(false);
                                handleProfileUpdate();
                            }}
                        />
                    </div>
                )
            }

            {
                showAddForm && (
                    <AddPortfolioModal onClose={() => setShowAddForm(false)} />
                )
            }

            {
                activePost && (
                    <PortfolioPostViewer post={activePost} onClose={() => setActivePost(null)} />
                )
            }

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
        </div >
    );
}
