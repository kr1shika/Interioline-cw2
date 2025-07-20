import { motion } from "framer-motion";

const toastColors = {
    success: "#10B981", // Green
    error: "#EF4444",   // Red
    info: "#3B82F6",    // Blue
    warning: "#F59E0B"  // Yellow/Amber
};

const toastIcons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠"
};

const Toast = ({ message, type = "info" }) => {
    const backgroundColor = toastColors[type] || toastColors.info;
    const icon = toastIcons[type] || toastIcons.info;

    const toastStyle = {
        position: "fixed",
        top: "64px",
        right: "24px",
        padding: "12px 16px",
        borderRadius: "6px",
        color: "white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        zIndex: 9999,
        maxWidth: "320px",
        backgroundColor: backgroundColor
    };

    const iconStyle = {
        fontWeight: "bold",
        marginRight: "4px"
    };

    const messageStyle = {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    };

    return (
        <motion.div
            style={toastStyle}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{
                type: "spring",
                stiffness: 120,
                damping: 15,
                duration: 0.5
            }}
        >
            <span style={iconStyle}>{icon}</span>
            <span style={messageStyle}>{message}</span>
        </motion.div>
    );
};

export default Toast;