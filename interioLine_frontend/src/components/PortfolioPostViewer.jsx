import { useEffect } from "react";

export default function PortfolioPostViewer({ post, onClose }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    if (!post) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0rem'
            }}
        >
            <div
                style={{
                    position: 'relative',
                    backgroundColor: 'white',
                    padding: '0.5rem',
                    borderRadius: '0.7rem',
                    width: '100%',
                    maxWidth: '30rem',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '0.3rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1rem',
                        color: '#6b7280',
                        cursor: 'pointer',
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                    }}
                >
                    ✕
                </button>

                <h2
                    style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: '#111827',
                        paddingLeft: '1rem'

                    }}
                >
                    {post.title}
                </h2>

                <div
                    style={{
                        display: 'flex',
                        gap: '0rem',
                        overflowX: 'auto',
                        paddingBottom: '0.5rem',
                        marginBottom: '1rem',
                        width: '100%'
                    }}
                >
                    {post.images.map((img, i) => (
                        <div
                            key={i}
                            style={{
                                minWidth: '29rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <img
                                src={`http://localhost:2005${img.url}`}
                                alt={img.caption || ""}
                                style={{
                                    height: '21rem',
                                    width: '27rem',
                                    borderRadius: '0.5rem',
                                    objectFit: 'cover',
                                    border: '1px solid #e5e7eb'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Swipe Indicator */}
                {post.images.length > 1 && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: '#6b7280',
                            fontSize: '0.875rem',
                        }}
                    >
                        {/*  */}
                    </div>
                )}

                {post.caption && (
                    <p
                        style={{
                            marginTop: '1.5rem',
                            fontSize: '0.95rem',
                            color: '#374151',
                            lineHeight: '1.6'
                        }}
                    >
                        {post.caption}
                    </p>
                )}
            </div>
        </div>
    );
}