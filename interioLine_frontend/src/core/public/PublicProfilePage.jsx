import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ useLocation instead of useParams
import AuthPromptModal from "../../components/AuthPromptModal";
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
import PortfolioPostViewer from "../../components/PortfolioPostViewer.jsx";
import { useAuth } from "../../provider/authcontext.jsx";
import "./../style/profile.css";


export default function PublicProfilePage() {
    const { state } = useLocation();
    const [designer, setDesigner] = useState(state?.designer || null);
    // const [designer, setDesigner] = useState(null);
    const [portfolioPosts, setPortfolioPosts] = useState([]);
    const [activePost, setActivePost] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const { userId, isLoggedIn, loading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDesigner = async () => {
            try {
                const res = await axios.get(`https://localhost:2005/api/user/${designer._id}`);
                setDesigner(res.data);
            } catch (err) {
                console.error("Error fetching designer profile", err);
            } finally {
                setLoadingProfile(false);
            }
        };

        const fetchPortfolioPosts = async () => {
            try {
                const res = await axios.get(`https://localhost:2005/api/portfolio/posts/${designer._id}`);
                setPortfolioPosts(res.data.posts || []);
            } catch (err) {
                console.error("Error fetching portfolio posts", err);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await axios.get(`https://localhost:2005/api/review/designer/${designer._id}`);
                setReviews(res.data.reviews || []);
                setAverageRating(res.data.averageRating || 0);
            } catch (err) {
                console.error("Error fetching reviews", err);
            }
        };
        if (designer._id) {
            fetchDesigner();
            fetchPortfolioPosts();
            fetchReviews();
        }
    }, [designer._id]);

    if (loadingProfile || !designer) {
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
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Header />
            <div className="profile-container">
                <div className="profile-card">
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
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <h1>{designer.full_name}</h1>
                                    {/* Average stars */}
                                    <div style={{ fontSize: '1.5rem', marginTop: '0.4rem', color: '#FFA500' }}>
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i}>
                                                {i < Math.round(averageRating) ? '★' : '☆'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="location">Kathmandu, Nepal</p>
                                <p className="bio">{designer.bio}</p>
                            </div>
                        </div>

                        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                            <button
                                className="edit-button"
                                onClick={() => {
                                    if (!isLoggedIn || !userId) {
                                        setShowAuthModal(true);
                                    } else {
                                        navigate("/initial-project", {
                                            state: {
                                                designerId: designer._id,
                                                userId
                                            }
                                        });
                                    }
                                }}
                            >
                                Select {designer.full_name}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Portfolio Section */}
                <section className="portfolio-section">
                    <div className="section-header">
                        <h2>Portfolio</h2>
                    </div>
                    <div className="portfolio-grid">
                        {portfolioPosts.length === 0 ? (
                            <div className="no-posts">No portfolio posts available.</div>
                        ) : (
                            portfolioPosts.map((post) => {
                                const primaryImage = post.images.find(img => img.is_primary) || post.images[0];
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
                                        src={review.client?.profilepic
                                            ? `https://localhost:2005${review.client.profilepic}`
                                            : "/assets/default-avatar.png"
                                        }
                                        alt={review.client?.full_name || "Anonymous"}
                                    />
                                    <strong>{review.client?.full_name || "Anonymous"}</strong>
                                    <small>Happy Client</small>
                                    <p>"{review.comment}"</p>
                                    <div className="review-stars">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <span key={i}>
                                                {i < review.rating ? '★' : '☆'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>

            {activePost && (
                <PortfolioPostViewer
                    post={activePost}
                    onClose={() => setActivePost(null)}
                />
            )}

            {showAuthModal && (
                <AuthPromptModal
                    variant="notLoggedIn"
                    onClose={() => setShowAuthModal(false)}
                />
            )}
            <Footer />

        </div>
    );
}