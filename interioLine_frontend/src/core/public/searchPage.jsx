import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import matchImg from "../../assets/images/MATCH.png";
import qbohemian from "../../assets/images/quiz/qbohemian.png";
import qminimalist from "../../assets/images/quiz/qminimalist.png";
import qmodern from "../../assets/images/quiz/qmodern.png";
import qscandinavian from "../../assets/images/quiz/qscandinavian.png";
import qtraditional from "../../assets/images/quiz/qtraditional.png";
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
import { useAuth } from "../../provider/authcontext.jsx";
import "../style/searchPage.css";
import AuthPopup from "./authComponent.jsx";

export default function SearchDesignersPage() {
    const [designers, setDesigners] = useState([]);
    const [showAuth, setShowAuth] = useState(false);
    const [isQuizBased, setIsQuizBased] = useState(false);
    const [userQuizData, setUserQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStyle, setSelectedStyle] = useState(null);
    const [isStyleFiltered, setIsStyleFiltered] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, userId, userRole } = useAuth();

    const calculateCompatibilityScore = (designer, quizAnswers) => {
        let score = 0;

        const quizStyle = quizAnswers["2"]?.toLowerCase();
        const quizTone = quizAnswers["4"]?.toLowerCase();
        const quizFunction = quizAnswers["5"]?.toLowerCase();

        if (designer.specialization?.toLowerCase().includes(quizStyle)) {
            score += 40;
        }

        if (
            designer.preferredTones &&
            Array.isArray(designer.preferredTones) &&
            designer.preferredTones.some(tone => tone.toLowerCase() === quizTone)
        ) {
            score += 30;
        }

        if (designer.approach?.toLowerCase() === quizFunction) {
            score += 30;
        }

        return score;
    };

    const truncateBio = (bio, maxLength = 90) => {
        if (!bio) return "Designer bio unavailable.";

        if (bio.length <= maxLength) {
            return bio;
        }

        const truncated = bio.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > maxLength * 0.8) {
            return truncated.substring(0, lastSpaceIndex) + "...";
        }

        return truncated + "...";
    };

    const generateStyleAnalysis = (answers) => {
        const parts = [];

        if (answers["2"]) {
            parts.push(`You like the ${answers["2"]} style.`);
        }

        if (answers["3"] === "Calm and simple") {
            parts.push("You enjoy calm, clean spaces with a peaceful feel.");
        } else if (answers["3"] === "Bold and unique") {
            parts.push("You love bold choices and creative designs.");
        } else {
            parts.push("You enjoy both bold features and peaceful elements.");
        }

        if (answers["4"]) {
            parts.push(`You're drawn to ${answers["4"]} tones.`);
        }

        if (answers["5"]?.toLowerCase().includes("functional")) {
            parts.push("You prefer designs that are practical and useful.");
        } else if (answers["5"]?.toLowerCase().includes("decorative")) {
            parts.push("You prefer designs that focus on beauty and charm.");
        } else {
            parts.push("You like a mix of usefulness and beauty.");
        }

        return parts.join(" ");
    };

    const handleStyleClick = async (styleName) => {
        try {
            setLoading(true);
            setSelectedStyle(styleName);
            setIsStyleFiltered(true);
            setIsQuizBased(false);

            console.log(`Filtering designers by style: ${styleName}`);

            const res = await axios.get(`https://localhost:2005/api/user/style/${styleName}`);
            const filteredDesigners = res.data.designers;

            console.log(`Found ${filteredDesigners.length} designers for ${styleName} style`);

            const designersWithPrimaryImage = await Promise.all(
                filteredDesigners.map(async (designer) => {
                    try {
                        const postRes = await axios.get(`https://localhost:2005/api/portfolio/posts/${designer._id}`);
                        const posts = postRes.data.posts;

                        const firstPost = posts[0];
                        let primaryImage = null;

                        if (firstPost && firstPost.images && firstPost.images.length > 0) {
                            const primary = firstPost.images.find(img => img.is_primary);
                            primaryImage = primary ? primary.url : firstPost.images[0].url;
                        }

                        return { ...designer, primaryImage };
                    } catch (err) {
                        console.error(`Error fetching portfolio for ${designer.full_name}:`, err);
                        return { ...designer, primaryImage: null };
                    }
                })
            );

            setDesigners(designersWithPrimaryImage);
        } catch (error) {
            console.error("Error filtering designers by style:", error);
            setDesigners([]);
        } finally {
            setLoading(false);
        }
    };

    const clearStyleFilter = () => {
        setSelectedStyle(null);
        setIsStyleFiltered(false);
        fetchAllDesigners();
    };

    const fetchAllDesigners = async () => {
        try {
            setLoading(true);

            const res = await axios.get("https://localhost:2005/api/user/getAllDesigners");
            const designersData = res.data;

            const designersWithPrimaryImage = await Promise.all(
                designersData.map(async (designer) => {
                    try {
                        const postRes = await axios.get(`https://localhost:2005/api/portfolio/posts/${designer._id}`);
                        const posts = postRes.data.posts;

                        const firstPost = posts[0];
                        let primaryImage = null;

                        if (firstPost && firstPost.images && firstPost.images.length > 0) {
                            const primary = firstPost.images.find(img => img.is_primary);
                            primaryImage = primary ? primary.url : firstPost.images[0].url;
                        }

                        return { ...designer, primaryImage };
                    } catch (err) {
                        console.error(`Error fetching portfolio for ${designer.full_name}:`, err);
                        return { ...designer, primaryImage: null };
                    }
                })
            );

            if (isLoggedIn && userId && userRole === "client") {
                try {
                    const userRes = await axios.get(`https://localhost:2005/api/user/${userId}`);
                    const userData = userRes.data;

                    if (userData.style_quiz && Object.keys(userData.style_quiz).length > 0) {
                        console.log("✅ User has quiz data, splitting designers by compatibility");

                        const designersWithScores = designersWithPrimaryImage.map(designer => ({
                            ...designer,
                            compatibilityScore: calculateCompatibilityScore(designer, userData.style_quiz)
                        }));

                        const sortedDesigners = designersWithScores.sort((a, b) =>
                            b.compatibilityScore - a.compatibilityScore
                        );

                        setDesigners(sortedDesigners);
                        setUserQuizData(userData.style_quiz);
                        setIsQuizBased(true);
                    } else {
                        setDesigners(designersWithPrimaryImage);
                        setIsQuizBased(false);
                    }
                } catch (error) {
                    console.error("Error fetching user quiz data:", error);
                    setDesigners(designersWithPrimaryImage);
                    setIsQuizBased(false);
                }
            } else {
                setDesigners(designersWithPrimaryImage);
                setIsQuizBased(false);
            }

        } catch (err) {
            console.error("Failed to fetch designers:", err);
            setDesigners([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const styleParam = searchParams.get('style');

        if (styleParam) {
            handleStyleClick(styleParam);
        } else {
            fetchAllDesigners();
        }
    }, [isLoggedIn, userId, userRole, location.search]);

    const getCompatibilityPercentage = (score) => {
        return Math.round((score / 100) * 100);
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const styleParam = searchParams.get('style');
        const queryParam = searchParams.get('query');

        if (styleParam) {
            handleStyleClick(styleParam);
        } else if (queryParam) {
            handleSearchQuery(queryParam);
        } else {
            fetchAllDesigners();
        }
    }, [isLoggedIn, userId, userRole, location.search]);


    const handleSearchQuery = async (query) => {
        try {
            setLoading(true);
            console.log(`Searching designers for query: ${query}`);
            const res = await axios.get(`https://localhost:2005/api/user/search/${query}`);
            const searchedDesigners = res.data.designers;

            const designersWithPrimaryImage = await Promise.all(
                searchedDesigners.map(async (designer) => {
                    try {
                        const postRes = await axios.get(`https://localhost:2005/api/portfolio/posts/${designer._id}`);
                        const posts = postRes.data.posts;

                        const firstPost = posts[0];
                        let primaryImage = null;

                        if (firstPost && firstPost.images && firstPost.images.length > 0) {
                            const primary = firstPost.images.find(img => img.is_primary);
                            primaryImage = primary ? primary.url : firstPost.images[0].url;
                        }

                        return { ...designer, primaryImage };
                    } catch (err) {
                        console.error(`Error fetching portfolio for ${designer.full_name}:`, err);
                        return { ...designer, primaryImage: null };
                    }
                })
            );

            setDesigners(designersWithPrimaryImage);
            setIsQuizBased(false);
            setIsStyleFiltered(false);
        } catch (error) {
            console.error("Error searching designers:", error);
            setDesigners([]);
        } finally {
            setLoading(false);
        }
    };


    const getCompatibilityBadgeClass = (score) => {
        if (score >= 80) return "compatibility-badge high";
        if (score >= 50) return "compatibility-badge medium";
        if (score >= 20) return "compatibility-badge low";
        return "compatibility-badge minimal";
    };

    const recommendedDesigners = isQuizBased && !isStyleFiltered
        ? designers.filter(designer => getCompatibilityPercentage(designer.compatibilityScore) >= 59)
        : [];

    const otherDesigners = isQuizBased && !isStyleFiltered
        ? designers.filter(designer => getCompatibilityPercentage(designer.compatibilityScore) < 59)
        : designers;

    return (
        <div className="page-wrapper">
            <Header onGetStartedClick={() => setShowAuth(true)} />
            <main>
                {/* Match Section */}
                <section className="match-section">
                    <div className="match-text">
                        <h2>MATCH WITH A DESIGNER</h2>
                        <p>Share your vision. We'll help you find the designer who gets it.</p>
                        <button onClick={() => navigate("/quiz")} className="match-button">
                            {isQuizBased ? "Retake Quiz" : "Match"}
                        </button>
                    </div>
                    <img src={matchImg} alt="Match Illustration" className="match-illustration" />
                </section>
                <section className="style-section">
                    <h3>Browse by Style</h3>
                    <div className="style-grid">
                        {[
                            { name: "Bohemian", image: qbohemian },
                            { name: "Minimalist", image: qminimalist },
                            { name: "Modern", image: qmodern },
                            { name: "Scandinavian", image: qscandinavian },
                            { name: "Traditional", image: qtraditional },
                        ].map((style, i) => (
                            <div
                                key={i}
                                className={`style-card ${selectedStyle === style.name ? 'selected' : ''}`}
                                onClick={() => handleStyleClick(style.name)}
                            >
                                <img src={style.image} alt={style.name} />
                                <p>{style.name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Style Filter Banner */}
                {isStyleFiltered && (
                    <section className="style-filter-banner">
                        <div className="filter-content">
                            <h3>Showing {designers.length} {selectedStyle} Designers</h3>
                            <p>Designers specializing in {selectedStyle} style</p>
                            <button onClick={clearStyleFilter} className="clear-filter-btn">
                                Show All Designers
                            </button>
                        </div>
                    </section>
                )}
                {isQuizBased && !isStyleFiltered && recommendedDesigners.length > 0 && (
                    <section className="recommended-designers-section">
                        <h3>
                            Recommended for You ({recommendedDesigners.length} matches)
                            {loading && <span className="loading-indicator"> (Loading...)</span>}
                        </h3>
                        <p className="recommendation-subtitle">
                            These designers are a {recommendedDesigners.length > 1 ? 'great match' : 'perfect match'} for your style preferences (59%+ compatibility)
                        </p>

                        <div className="designers-grid recommended-grid">
                            {recommendedDesigners.map((designer, i) => (
                                <div
                                    key={designer._id || i}
                                    className="designer-card recommended"
                                    onClick={() => navigate("/designer", {
                                        state: { designer }
                                    })}
                                >
                                    <div className="designer-header">
                                        <img
                                            src={
                                                designer.profilepic
                                                    ? `https://localhost:2005${designer.profilepic}`
                                                    : "/assets/default-avatar.png"
                                            }
                                            alt={designer.full_name}
                                            className="designer-profile-pic"
                                        />
                                        <div>
                                            <h4>{designer.full_name}</h4>
                                            <p>{truncateBio(designer.bio, 90)}</p>
                                            {designer.specialization && (
                                                <p className="specialization">
                                                    Specializes in {designer.specialization}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <img
                                        src={
                                            designer.primaryImage
                                                ? `https://localhost:2005${designer.primaryImage}`
                                                : "/assets/rooms/sample1.jpg"
                                        }
                                        alt="room"
                                        className="room-preview"
                                    />
                                    <div className="compatibility-details">
                                        <p className="compatibility-text">
                                            Perfect match for your {userQuizData["2"]?.toLowerCase()} style preferences
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* All Designers Section */}
                <section className="designers-section">
                    <h3>
                        {isStyleFiltered
                            ? `${selectedStyle} Designers`
                            : isQuizBased
                                ? `All Designers${otherDesigners.length > 0 ? ` (${otherDesigners.length} more)` : ''}`
                                : "Meet Our Designers"
                        }
                        {loading && <span className="loading-indicator"> (Loading...)</span>}
                    </h3>

                    {loading ? (
                        <div className="loading-placeholder">
                            <p>Finding the perfect designers for you...</p>
                        </div>
                    ) : (
                        <>
                            <div className={`designers-grid ${designers.length === 0 && isStyleFiltered ? 'empty-state' : ''}`}>
                                {designers.length === 0 && isStyleFiltered ? (
                                    <div className="no-designers-found">
                                        <h4>No {selectedStyle} designers found</h4>
                                        <p>Try browsing other styles or <button onClick={clearStyleFilter} className="link-button">view all designers</button></p>
                                    </div>
                                ) : (
                                    (isStyleFiltered ? designers : isQuizBased ? otherDesigners : designers).map((designer, i) => (
                                        <div
                                            key={designer._id || i}
                                            className={`designer-card ${isStyleFiltered ? 'style-filtered' : ''}`}
                                            onClick={() => navigate("/designer", {
                                                state: { designer }
                                            })}
                                        >
                                            <div className="designer-header">
                                                <img
                                                    src={
                                                        designer.profilepic
                                                            ? `https://localhost:2005${designer.profilepic}`
                                                            : "/assets/default-avatar.png"
                                                    }
                                                    alt={designer.full_name}
                                                    className="designer-profile-pic"
                                                />
                                                <div>
                                                    <h4>{designer.full_name}</h4>
                                                    <p>{truncateBio(designer.bio, 60)}</p>
                                                    {designer.specialization && (
                                                        <p className="specialization">
                                                            Specializes in {designer.specialization}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <img
                                                src={
                                                    designer.primaryImage
                                                        ? `https://localhost:2005${designer.primaryImage}`
                                                        : "/assets/rooms/sample1.jpg"
                                                }
                                                alt="room"
                                                className="room-preview"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>

                            {!isStyleFiltered && (
                                <div className="load-more">
                                    <button>MORE</button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>

            {showAuth && <AuthPopup onClose={() => setShowAuth(false)} />}
            <Footer />

        </div>
    );
}