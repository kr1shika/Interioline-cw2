import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCsrfToken } from "./../provider/csrf";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [skipInit, setSkipInit] = useState(false); // 🔁 controls re-fetching after logout

    const logout = useCallback(async () => {
        try {
            const csrfToken = await getCsrfToken();

            await axios.post("/api/auth/logout", {}, {
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken
                },
                withCredentials: true
            });
        } catch (error) {
            // silent fail
        } finally {
            setIsLoggedIn(false);
            setUserRole("");
            setUser(null);
            setSkipInit(true); // 🚫 skip session recheck on mount
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
                },
                withCredentials: true
            });

            const userData = res.data;

            setIsLoggedIn(true);
            setUserRole(userData.role?.toLowerCase() || "");
            setUser(userData);
        } catch (err) {
            logout(); // clean up invalid session
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        if (!skipInit) {
            initializeAuth();
        } else {
            setLoading(false); // prevent hanging UI
        }
    }, [initializeAuth, skipInit]);

    const hasRole = useCallback((role) => {
        return userRole === role.toLowerCase();
    }, [userRole]);

    const hasAnyRole = useCallback((roles) => {
        return roles.some(role => userRole === role.toLowerCase());
    }, [userRole]);

    const updateUserProfile = useCallback((updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
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

export const useAuth = () => useContext(AuthContext);
