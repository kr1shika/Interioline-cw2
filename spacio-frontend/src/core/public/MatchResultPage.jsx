import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import match1 from "../../assets/images/MATCH.png";
import Header from "../../components/header.jsx";
import { useAuth } from "../../provider/authcontext";
import "../style/Matchresult.css";

export default function MatchResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showAuth, setShowAuth] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const { userName, match, styleAnalysis } = location.state || {};

    const { isLoggedIn, userId, loading } = useAuth();

    useEffect(() => {
        if (!match) {
            navigate("/style-quiz");
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const res = await fetch("/api/user/getAllDesigners");
                const data = await res.json();

                const filtered = data.filter(d => d._id !== match._id);

                const enhanced = await Promise.all(
                    filtered.map(async (designer) => {
                        try {
                            const postRes = await fetch(`/api/portfolio/posts/${designer._id}`);
                            const postData = await postRes.json();
                            const post = postData.posts[0];
                            const image =
                                post?.images.find(img => img.is_primary)?.url ||
                                post?.images[0]?.url ||
                                null;
                            return { ...designer, primaryImage: image };
                        } catch {
                            return { ...designer, primaryImage: null };
                        }
                    })
                );

                setSuggestions(enhanced);
            } catch (err) {
                console.error("Failed to load designers:", err);
            }
        };

        const fetchMatchPost = async () => {
            try {
                const res = await fetch(`/api/portfolio/posts/${match._id}`);
                const data = await res.json();
                const post = data.posts[0];
                const image =
                    post?.images.find(img => img.is_primary)?.url ||
                    post?.images[0]?.url ||
                    null;

                match.primaryImage = image;
            } catch (err) {
                console.error("Failed to fetch matched designer image", err);
            }
        };

        fetchMatchPost();
        fetchSuggestions();
    }, [match, navigate]);

    // Show loading while auth is being determined
    if (loading) {
        return <div>Loading...</div>;
    }

    const handleSelectDesigner = () => {
        if (!isLoggedIn) {
            setShowAuth(true);
            return;
        }

        navigate("/initial-project", {
            state: {
                userId: userId, // Use userId from auth context
                designerId: match?._id,
            },
        });
    };

    return (
        <div className="match-page">
            <Header onGetStartedClick={() => setShowAuth(true)} />

            {/* Hero Section */}
            <section className="match-hero">
                <div className="hero-left">
                    <img
                        src={match1}
                        alt="match logo"
                        className="match-logo"
                        style={{ width: "230px", objectFit: "contain" }}
                    />
                    <h2>{userName}, Meet {match?.full_name}!</h2>
                    <p>Based on your preferences, we've found a designer who fits your style and needs best.</p>
                    <p className="style-analysis">{styleAnalysis}</p>
                </div>

                <div className="hero-right">
                    <img
                        src={
                            match?.primaryImage
                                ? `${match.primaryImage}`
                                : "/assets/rooms/sample1.jpg"
                        }
                        alt="room"
                    />

                    <div className="designer-info">
                        <div className="designer-meta">
                            <img
                                src={
                                    match?.profilepic
                                        ? `${match.profilepic}`
                                        : "/assets/default-avatar.png"
                                }
                                alt="profile"
                            />
                            <div>
                                <h3>{match.full_name}</h3>
                                <p className="specialization">{match.specialization}</p>
                            </div>
                        </div>
                        <button
                            className="select-btn"
                            onClick={handleSelectDesigner}
                        >
                            {isLoggedIn ? `Select ${match.full_name}` : 'Login to Select'}
                        </button>
                    </div>
                </div>
            </section>

            {/* More Suggestions Section */}
            <section className="suggestions">
                <h4>More Suggestions</h4>
                <div className="suggestion-list">
                    {suggestions.map((designer, index) => (
                        <div key={index} className="suggestion-card">
                            <img
                                src={
                                    designer.primaryImage
                                        ? `${designer.primaryImage}`
                                        : "/sample2.jpg"
                                }
                                alt="room"
                            />
                            <div className="suggestion-info">
                                <div className="suggestion-meta">
                                    <img
                                        src={
                                            designer.profilepic
                                                ? `${designer.profilepic}`
                                                : "/default-avatar.png"
                                        }
                                        alt="profile"
                                    />
                                    <div>
                                        <h5>{designer.full_name}</h5>
                                        <p className="specialization">{designer.specialization}</p>
                                    </div>
                                </div>
                                <button
                                    className="suggestion-select-btn"
                                    onClick={() => {
                                        if (!isLoggedIn) {
                                            setShowAuth(true);
                                            return;
                                        }
                                        navigate("/initial-project", {
                                            state: {
                                                userId: userId,
                                                designerId: designer._id,
                                            },
                                        });
                                    }}
                                >
                                    {isLoggedIn ? 'Select' : 'Login to Select'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}