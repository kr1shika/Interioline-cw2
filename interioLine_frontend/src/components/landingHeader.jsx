import { Search, X } from 'lucide-react';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useAuth } from "../provider/authcontext";
import "./landingHeader.css";
import ProfileMenu from "./ProfileMenu";

const LandingHeader = ({ onGetStartedClick }) => {
    const { isLoggedIn, user, loading } = useAuth();
    const navigate = useNavigate();

    const [searchActive, setSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleToggleSearch = () => {
        if (searchActive && searchQuery) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        } else if (searchActive) {
            setSearchActive(false);
            setSearchQuery("");
        } else {
            setSearchActive(true);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };
    if (loading) {
        return (
            <div className="landnavbar">
                <div className="landnavbar-left landnavbar-title">
                    <div className="logo">
                        <div className="logo-icon">
                            <img src={logo} alt="Spacio Logo" />
                        </div>
                        <Link to="/Home" className="logo-text">
                            Spacio
                        </Link>
                    </div>
                </div>

                <div className="landnavbar-right">
                    <div style={{
                        color: '#C2805A',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px'
                    }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="landnavbar">
            <div className="landnavbar-left landnavbar-title">
                <div className="logo">
                    <div className="logo-icon">
                        <img src={logo} alt="Spacio Logo" />
                    </div>
                    <Link to="/Home" className="logo-text">
                        Spacio
                    </Link>
                </div>
            </div>
            {isLoggedIn && user ? (
                <div className="landnavbar-right">
                    <div className={`header-search-container ${searchActive ? 'active' : ''}`}>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="header-search-input"
                                placeholder="Search..."
                                autoFocus={searchActive}
                            />
                        </form>
                    </div>

                    <button
                        className={`search-toggle-button ${searchActive ? 'spin' : ''}`}
                        onClick={handleToggleSearch}
                    >
                        {searchActive ? <X size={20} /> : <Search size={20} />}
                    </button>
                    {/* <NotificationComponent userId={userId} /> */}
                    <ProfileMenu />
                </div>
            ) : (
                <div className="landnavbar-right">
                    <div className={`header-search-container ${searchActive ? 'active' : ''}`}>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="header-search-input"
                                placeholder="Search..."
                                autoFocus={searchActive}
                            />
                        </form>
                    </div>

                    <button
                        className={`search-toggle-button ${searchActive ? 'spin' : ''}`}
                        onClick={handleToggleSearch}
                    >
                        {searchActive ? <X size={20} /> : <Search size={20} />}
                    </button>

                    <button
                        onClick={onGetStartedClick}
                        className="landnav-link start-now-button"
                    >
                        Start Now
                    </button>
                </div>
            )}
        </div>
    );
};

export default LandingHeader;
