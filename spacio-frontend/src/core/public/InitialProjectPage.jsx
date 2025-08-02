import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import match from "../../assets/images/contact.png";
import img2 from "../../assets/images/meow.png";
import img3 from "../../assets/images/meow101.png";
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
import { getCsrfToken } from "../../provider/csrf";
import "../style/initiatizeProject.css";
import UploadRoomDataModal from "./../../components/project-detail-form.jsx";

export default function InitialProjectPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // const userId = location.state?.userId || null;
    const designerId = location.state?.designerId || null;

    const [title, setTitle] = useState("");
    const [placeholder, setPlaceholder] = useState("Loading...");
    const [designer, setDesigner] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [createdProjectId, setCreatedProjectId] = useState(null);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        if (!designerId) {
            console.warn("Missing userId or designerId for initialization:", { designerId });
            return;
        }

        const fetchData = async () => {
            try {
                const userRes = await axios.get("https://localhost:2005/api/user/me", {
                    withCredentials: true,
                });
                const designerRes = await axios.get(`https://localhost:2005/api/user/${designerId}`);

                const quizAnswer1 = userRes.data?.style_quiz?.["1"];
                setPlaceholder(quizAnswer1 || "Untitled Project");
                setDesigner(designerRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, [designerId]);

    const handleConfirm = async () => {
        try {
            const csrfToken = await getCsrfToken(); // 🛡 Fetch CSRF token first

            const res = await axios.post(
                "https://localhost:2005/api/project/createProject",
                {
                    title: title || placeholder,
                    designer: designerId,
                    payment: "pending",
                },
                {
                    withCredentials: true, //  Include session cookie
                    headers: {
                        "CSRF-Token": csrfToken, //  Attach CSRF token here
                        "Content-Type": "application/json"
                    }
                }
            );

            if (res.status === 201) {
                setCreatedProjectId(res.data.project._id);
                setShowUploadModal(true);
            }
        } catch (err) {
            console.error("Failed to create project:", err);
            alert("Failed to initialize project.");
        }
    };


    const handleModalClose = () => {
        setShowUploadModal(false);
        navigate("/my-projects");
    };

    // 🚀 Show fallback if data missing
    if (!designerId) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#4D5A4A" }}>
                <Header />
                <h3>⚠️ Cannot initialize project</h3>
                <p>Missing user or designer information. Please go back and start from your profile or quiz page.</p>
                <button
                    style={{
                        marginTop: "1rem",
                        background: "#4D5A4A",
                        color: "white",
                        padding: "0.75rem 1.5rem",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    // 🚀 Show loading state until designer data fetched
    if (!designer) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#4D5A4A" }}>
                <Header />
                <h3>Loading project setup...</h3>
            </div>
        );
    }

    return (
        <div className="initial-project-page">
            <Header onGetStartedClick={() => setShowAuth(true)} />

            <h2>Initialize your project</h2>

            <div className="designer-avatar-wrapper">
                <img
                    className="designer-avatar"
                    src={
                        designer.profilepic
                            ? `https://localhost:2005${designer.profilepic}`
                            : "/assets/default-avatar.png"
                    }
                    alt="designer avatar"
                />
                <p className="selection-line">
                    You've selected&nbsp;
                    <strong>"{designer.full_name}"</strong>
                    &nbsp;for your project -
                    <div className={`project-title-input-wrapper ${title ? 'hide-cursor' : ''}`}>
                        <input
                            type="text"
                            className="project-title-input"
                            placeholder={placeholder}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                </p>
            </div>

            <div className="payment-cards">
                <div className="card">
                    <img src={img3} alt="" />
                    <h4>Kick-off and Discovery</h4>
                    <p>Share ideas and scope</p>
                    <span className="price">$0</span>
                </div>

                <div className="card">
                    <img src={match} alt="" />
                    <h4>Design work deposit</h4>
                    <p>Share ideas and scope</p>
                    <span className="price">from $90</span>
                </div>

                <div className="card">
                    <img src={img2} alt="" />
                    <h4>Final delivery</h4>
                    <p>Share ideas and scope</p>
                    <span className="price">from $200</span>
                </div>
            </div>

            <button className="confirm-btn" onClick={handleConfirm}>
                Confirm
            </button>

            {showUploadModal && createdProjectId && (
                <UploadRoomDataModal
                    onClose={handleModalClose}
                    projectId={createdProjectId}
                />
            )}
            <Footer />

        </div>
    );
}
