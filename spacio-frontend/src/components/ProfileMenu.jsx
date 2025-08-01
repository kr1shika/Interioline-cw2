import { useRef, useState } from "react";
import { GoProjectRoadmap } from "react-icons/go";
import { IoLogOutOutline } from "react-icons/io5";
import { RiAccountBoxLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../assets/images/ham.jpg";
import { useAuth } from "../provider/authcontext";

const ProfileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, userRole, user, userId } = useAuth();
    const navigate = useNavigate();

    const hoverTimeout = useRef(null);

    const handleMouseEnter = () => {
        clearTimeout(hoverTimeout.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        hoverTimeout.current = setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };

    const handleLogout = async () => {
        try {
            logout();
            setIsOpen(false);
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            navigate("/");
        }
    };

    const handleProfileClick = () => {
        setIsOpen(false);
        if (userRole === "designer") {
            navigate("/designer-profile");
        } else {
            navigate("/my-projects");
        }
    };

    const handleProjectsClick = () => {
        setIsOpen(false);
        navigate("/my-projects");
    };

    // Get profile picture from user data or use default
    const profilePicture = user?.profile_picture
        ? `{user.profile_picture}`
        : user?.profilepic
            ? `${user.profilepic}`
            : defaultProfile;

    return (
        <div
            style={{
                position: "relative",
                display: "inline-block",
                cursor: "pointer"
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img
                src={profilePicture}
                alt="Profile"
                style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #4D5A4A"
                }}
                onError={(e) => {
                    e.target.src = defaultProfile;
                }}
            />

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "40px",
                        backgroundColor: "#FFFFF6",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        minWidth: "180px",
                        overflow: "hidden",
                        color: "#374635",
                    }}
                >
                    <ul style={{
                        listStyle: "none",
                        margin: 0,
                        padding: "8px 0"
                    }}>
                        {/* Show My Projects only for designers */}
                        {userRole === "designer" && (
                            <li
                                style={menuItemStyle}
                                onClick={handleProjectsClick}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                            >
                                <GoProjectRoadmap size={16} style={{ color: "#374635" }} />
                                My Projects
                            </li>
                        )}

                        <li
                            style={menuItemStyle}
                            onClick={handleProfileClick}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                        >
                            {userRole === "designer" ? (
                                <>
                                    <RiAccountBoxLine size={16} style={{ color: "#374635" }} />
                                    My Profile
                                </>
                            ) : (
                                <>
                                    <RiAccountBoxLine size={16} style={{ color: "#374635" }} />
                                    My Account
                                </>
                            )}
                        </li>

                        <li style={{
                            height: "1px",
                            backgroundColor: "#e9ecef",
                            margin: "8px 0"
                        }} />

                        <li
                            style={{
                                ...menuItemStyle,
                                color: "#dc3545"
                            }}
                            onClick={handleLogout}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#fff5f5";
                                e.target.style.color = "#dc3545";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "#dc3545";
                            }}
                        >
                            <IoLogOutOutline size={16} />
                            Logout
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const menuItemStyle = {
    padding: "10px 16px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#374635",

};

export default ProfileMenu;