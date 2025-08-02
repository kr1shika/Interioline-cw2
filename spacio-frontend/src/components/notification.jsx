

import { useEffect, useRef, useState } from 'react';
import {
    FaBell, FaBriefcase,
    FaCog, FaComment,
    FaCreditCard, FaStar
} from 'react-icons/fa';

const NotificationComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState(false);
    const dropdownRef = useRef(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/notifications', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${text}`);
            }

            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && notifications.length === 0) fetchNotifications();
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            setNotifications((prev) =>
                prev.map((n) => n._id === id ? { ...n, is_read: true } : n)
            );
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (markingAsRead) return;
        setMarkingAsRead(true);
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Mark all read failed:', err);
        } finally {
            setMarkingAsRead(false);
        }
    };

    const formatTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const diff = (new Date() - date) / 60000;
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${Math.floor(diff)}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const getNotificationIcon = (type) => {
        const iconProps = { color: '#4D5A4A' };
        switch (type) {
            case 'project_update': return <FaBriefcase {...iconProps} />;
            case 'message': return <FaComment {...iconProps} />;
            case 'payment': return <FaCreditCard {...iconProps} />;
            case 'system': return <FaCog {...iconProps} />;
            case 'review': return <FaStar {...iconProps} />;
            default: return <FaBell {...iconProps} />;
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="notification-container" style={{ position: 'relative', display: 'inline-block' }}>
            <button
                title="Notifications"
                onClick={() => setIsOpen(!isOpen)}
                style={{ position: 'relative' }}>
                <FaBell className="navicon" />
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#dc3545', borderRadius: '50%', width: '10px', height: '10px' }}></span>
                )}
            </button>

            {isOpen && (
                <div ref={dropdownRef} style={{ position: 'absolute', right: 0, top: '100%', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 8, width: 300, zIndex: 10 }}>
                    <div style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Notifications</span>
                        {unreadCount > 0 && <button onClick={markAllAsRead} style={{ fontSize: 12 }}>Mark all</button>}
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {loading ? <p style={{ padding: 10 }}>Loading...</p> :
                            error ? <p style={{ padding: 10, color: 'red' }}>{error}</p> :
                                notifications.length === 0 ? <p style={{ padding: 10 }}>No notifications</p> :
                                    notifications.map((n, i) => (
                                        <div key={n._id} onClick={() => !n.is_read && markAsRead(n._id)} style={{ padding: 10, backgroundColor: n.is_read ? '#fff' : '#FCFCEC', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {getNotificationIcon(n.type)}
                                                <div style={{ flex: 1 }}>
                                                    <strong>{n.title}</strong>
                                                    <p style={{ margin: 0, fontSize: 12 }}>{n.message}</p>
                                                    <small style={{ color: '#999' }}>{formatTimeAgo(n.createdAt)}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationComponent;
