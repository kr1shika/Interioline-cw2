import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import img3 from "../../assets/images/contact.png";
import match from "../../assets/images/MATCH.png";
import img2 from "../../assets/images/project.png";
import room from "../../assets/images/room-101.png";

import AutoCarousel from "../../components/autocarousel.jsx";
import Footer from "../../components/footer.jsx";
import LandingHeader from "../../components/landingHeader.jsx";
import ThreeCanvas from "../../components/room.jsx";
import "../style/LandingPage.css";
import AuthPopup from "./authComponent.jsx";

import promoVideo from "../../assets/images/room-editor.mp4";

function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);
    const [activeStep, setActiveStep] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -30% 0px', 
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const stepNumber = entry.target.getAttribute('data-step');
                    setActiveStep(stepNumber);
                }
            });
        }, observerOptions);

        // Observe all step elements
        const stepElements = document.querySelectorAll('.step-wrapper');
        stepElements.forEach((el) => observer.observe(el));

        return () => {
            stepElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    return (
        <div className="landing-page">
            {/* <LandingHeader /> */}
            <LandingHeader onGetStartedClick={() => setShowAuth(true)} />

            <div className="main-content">
                <div className="text-section" style={{}}>
                    <h1>
                        Share Your Space, Explore ideas, and see designs come to life
                    </h1>
                    <p>
                        A platform where clients and interior designers collaborate. Clients share ideas,
                        and designers create 3D models while they communicate and update each other.
                    </p>
                    <button onClick={() => navigate("/search")}>
                        Find designer and create room of your dream                    </button>
                </div>

                <div className="canvas-section">
                    {/* <ThreeCanvas /> */}
                                                        <img src={room}  />
                </div>
            </div>

            <div className="carousel-section">
                <AutoCarousel />
            </div>

            {/* How Spacio Works Section */}
            <div className="how-it-works-section">
                <h2 className="how-it-works-title">How Spacio Works</h2>

                <div className="steps-container">
                    {/* Central dotted line */}
                    <div className="central-line"></div>

                    {/* Step 1 - Text Left, Image Right */}
                    <div className={`step-wrapper step-1 ${activeStep === '1' ? 'active' : ''}`} data-step="1">
                        <div className="step-content-side left-side">
                            <div className={`step-number ${activeStep === '1' ? 'animate' : ''}`}>1</div>
                            <div style={{ color: "#374635" }} className={`text-content ${activeStep === '1' ? 'animate' : ''}`}>
                                <h3 style={{ color: "#374635" }}>FIND YOUR IDEAL DESIGNER</h3>
                                <div className="description-box">
                                    <p>Get paired with the ideal designer based on your style and needs, and browse profiles to choose the perfect fit.</p>
                                </div>
                            </div>
                        </div>
                        <div className="step-image-side right-side">
                            <div className="step-illustration">
                                <div className="illustration-placeholder">
                                    <img src={match} style={{ height: "290px" }} alt="Match Icon" className={`step-icon ${activeStep === '1' ? 'animate' : ''}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 - Image Left, Text Right */}
                    <div className={`step-wrapper step-2 ${activeStep === '2' ? 'active' : ''}`} data-step="2">
                        <div className="step-image-side left-side">
                            <div className="step-illustration">
                                <div className="illustration-placeholder">
                                    <img src={img2} alt="Match Icon" className={`step-icon ${activeStep === '2' ? 'animate' : ''}`} />
                                </div>
                            </div>
                        </div>
                        <div className="step-content-side right-side">
                            <div className={`step-number ${activeStep === '2' ? 'animate' : ''}`}>2</div>
                            <div className={`text-content ${activeStep === '2' ? 'animate' : ''}`}>
                                <h3 style={{ color: "#374635" }}>INSPIRE & SHARE YOUR VISION</h3>
                                <div className="description-box">
                                    <p>Upload room details and inspirations, then discuss your ideas directly with your designer to shape the vision.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 - Text Left, Image Right */}
                    <div className={`step-wrapper step-3 ${activeStep === '3' ? 'active' : ''}`} data-step="3">
                        <div className="step-content-side left-side">
                            <div className={`step-number ${activeStep === '3' ? 'animate' : ''}`}>3</div>
                            <div className={`text-content ${activeStep === '3' ? 'animate' : ''}`}>
                                <h3 style={{ color: "#374635" }}>COLLABORATION AND COMMITMENT</h3>
                                <div className="description-box">
                                    <p>Receive design updates along the way and give instant feedback to refine every detail together.</p>
                                </div>
                            </div>
                        </div>
                        <div className="step-image-side right-side">
                            <div className="step-illustration">
                                <div className="illustration-placeholder">
                                    <img src={img3} alt="Match Icon" className={`step-icon ${activeStep === '3' ? 'animate' : ''}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 - Bottom Center */}
                    <div className={`step-wrapper step-4 ${activeStep === '4' ? 'active' : ''}`} data-step="4">
                        <div className="step-content-center">
                            <div className={`step-number ${activeStep === '4' ? 'animate' : ''}`}>4</div>
                            <div className={`text-content ${activeStep === '4' ? 'animate' : ''}`}>
                                <h3>YOUR DREAM SPACE, <span className="delivered-text">DELIVERED!</span></h3>
                                <div className="description-box">
                                    <p>Once you're satisfied, receive the complete design plan with 3D visuals, item list, and setup guidance.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="video-section">
                        <div className="video-wrapper">
                            <video
                                className="landing-video"
                                autoPlay
                                loop
                                muted
                                playsInline
                            >
                                <source src={promoVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>

                            {/* Button Below Video */}
                            <button className="edit-room-btn" onClick={() => navigate("/room-edit")}>
                                Go to Editing Room
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            {showAuth && <AuthPopup onClose={() => setShowAuth(false)} />}
            <Footer />

        </div>
    );
}

export default LandingPage;