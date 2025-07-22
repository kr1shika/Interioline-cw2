import axios from "axios";
import { FolderOpen, HelpCircle, Home, Search, X } from 'lucide-react';
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useAuth } from "../provider/authcontext";
import ChatIconWithWidget from "./chatIcon";
import "./Headerr.css";
import NotificationComponent from "./notification";
import ProfileMenu from "./ProfileMenu";

const Header = ({ onGetStartedClick }) => {
    const { isLoggedIn, loading, user, getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const userId = user?._id;
    const [searchActive, setSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [hasProjects, setHasProjects] = useState(false);

    const handleToggleSearch = () => {
        if (searchActive && searchQuery) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        } else if (searchActive) {
            // Just close
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

    useEffect(() => {
        const fetchProjectCount = async () => {
            if (!isLoggedIn) return;

            try {
                const res = await axios.get("https://localhost:2005/api/project/my", {
                    withCredentials: true,
                });
                const projects = res.data || [];
                setHasProjects(projects.length > 0);
            } catch (err) {
                console.error("❌ Failed to fetch projects:", err);
            }
        };

        fetchProjectCount();
    }, [isLoggedIn]);


    if (loading) {
        return (
            <div className="navbar">
                <div className="navbar-left">
                    <div className="logo">
                        <div className="logo-icon">
                            <Home size={20} />
                        </div>
                        <Link to="/Home" className="logo-text">
                            InterioLine
                        </Link>
                    </div>
                </div>
                <div className="navbar-right">
                    <div className="loading-text">
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="navbar">
            <div className="navbar-left">
                <div className="logo">
                    <div className="logo-icon">
                        <img src={logo} alt="InterioLine Logo" />
                    </div>
                    <Link to="/Home" className="logo-text">
                        InterioLine
                    </Link>
                </div>

                <nav className="nav">
                    <Link
                        to="/help-center"
                        className={`nav-item ${location.pathname === '/help-center' ? 'active' : ''}`}
                    >
                        <HelpCircle size={16} />
                        Help Center
                    </Link>
                    <Link
                        to={isLoggedIn && hasProjects ? "/my-projects" : "/room-edit"}
                        className={`nav-item ${['/my-projects', '/room-edit'].includes(location.pathname) ? 'active' : ''}`}
                    >
                        <FolderOpen size={16} />
                        Projects
                    </Link>
                </nav>
            </div>

            <div className="navbar-right">
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

                {isLoggedIn ? (
                    <>
                        <NotificationComponent />
                        <ChatIconWithWidget />
                        <ProfileMenu />
                    </>
                ) : (
                    <button
                        onClick={onGetStartedClick}
                        className="get-started-button"
                    >
                        Get Started
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;
