import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCsrfToken } from "./../provider/csrf";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const logout = useCallback(async () => {
        try {
            const csrfToken = await getCsrfToken();

            await axios.post("/api/auth/logout", {}, {
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken
                }, withCredentials: true
            });
        } catch (error) {
            // console.error("Logout API call failed:", error);
        } finally {
            setIsLoggedIn(true);
            setUserRole("");
            setUser(null);
            // console.log("✅ Logout complete");
        }
    }, []);

    const login = useCallback((id, role, userData = null) => {
        const lowerRole = role.toLowerCase();
        setIsLoggedIn(true);
        setUserRole(lowerRole);
        setUser(userData);
    }, []);

    const initializeAuth = useCallback(async () => {
        try {
            const csrfToken = await getCsrfToken();

            const res = await axios.get("/api/auth/me", {
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken
                }, withCredentials: true
            });
            const userData = res.data;

            setIsLoggedIn(true);
            setUserRole(userData.role?.toLowerCase() || "");
            setUser(userData);

            // console.log("✅ Session restored via cookie");
        } catch (err) {
            // console.log("❌ No valid session:", err.message);
            logout();
        }
        setLoading(false);
    }, [logout]);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const hasRole = useCallback((role) => {
        return userRole === role.toLowerCase();
    }, [userRole]);

    const hasAnyRole = useCallback((roles) => {
        return roles.some(role => userRole === role.toLowerCase());
    }, [userRole]);

    const updateUserProfile = useCallback((updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        // localStorage.setItem("user", JSON.stringify(updatedUser));
        // console.log("✅ User profile updated");
    }, [user]);

    const contextValue = {
        isLoggedIn,
        userRole,
        user,
        loading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// export const useAuth = () => {
//     const { setUser } = useContext(AuthContext);

//     const login = (email, role) => {
//         if (!email || !role) {
            console.error("Missing email or role in login()");
//             return;
//         }

//         setUser({
//             email: email.toLowerCase(),
//             role,
//         });
//     };

//     return { login };
// };

export const useAuth = () => useContext(AuthContext);
