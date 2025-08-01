import { Download, Eye, EyeOff, Package, RotateCw, Ruler, Trash2 } from "lucide-react";
import './PlacedItemsList.css';

const PlacedItemsList = ({
    items,
    onRotate,
    onRemove,
    onClearAll,
    onToggleVisibility,
    loadingState,
}) => {
    const totalArea = items.reduce((total, item) => {
        if (item.dimensions) {
            return total + item.dimensions.width * item.dimensions.depth;
        }
        return total;
    }, 0);

    const totalValue = items.reduce((total, item) => {
        return total + (item.price || 0);
    }, 0);

    const getTypeInfo = (type) => {
        const typeMap = {
            sofa: { icon: "🛋️", className: "sofa" },
            chair: { icon: "🪑", className: "chair" },
            table: { icon: "🪆", className: "table" },
            bed: { icon: "🛏️", className: "bed" },
            storage: { icon: "🗄️", className: "storage" },
            desk: { icon: "🖥️", className: "desk" },
            entertainment: { icon: "📺", className: "entertainment" },
            lighting: { icon: "💡", className: "lighting" },
            decoration: { icon: "🌿", className: "decoration" },
            default: { icon: "📦", className: "default" },
        };

        return typeMap[type] || typeMap.default;
    };

    const getCategoryStats = () => {
        const stats = {};
        items.forEach(item => {
            if (!stats[item.category]) {
                stats[item.category] = { count: 0, value: 0 };
            }
            stats[item.category].count++;
            stats[item.category].value += item.price || 0;
        });
        return stats;
    };

    const categoryStats = getCategoryStats();

    if (items.length === 0 && !loadingState?.isLoading) {
        return (
            <div className="placed-items-container">
                <div className="placed-items-body">
                    <div className="empty-state">
                        <Package className="empty-state-icon" />
                        <h3>No 3D Furniture Placed</h3>
                        <p>Select 3D furniture models from the catalog above to start designing your room</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="placed-items-container">
            <div className="placed-items-body">
                {/* Header */}
                <div className="placed-items-header">
                    <div className="header-title">
                        <Download className="header-icon" />
                        <h3>3D Furniture Collection</h3>
                    </div>
                    {items.length > 0 && (
                        <button
                            className="clear-all-btn"
                            onClick={onClearAll}
                        >
                            <Trash2 className="action-icon" />
                            Clear All
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {loadingState?.isLoading && (
                    <div className="loading-section">
                        <div className="loading-header">
                            <Download className="loading-icon" />
                            <span className="loading-text">
                                Loading 3D Model: {loadingState.currentItem || "Processing..."}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${loadingState.progress || 0}%` }}
                            />
                        </div>
                        <div className="progress-info">
                            {loadingState.progress ? `${Math.round(loadingState.progress)}% complete` : "Initializing..."}
                            {loadingState.totalItems > 0 && (
                                <span style={{ marginLeft: '0.5rem' }}>
                                    ({loadingState.completedItems}/{loadingState.totalItems} items)
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Statistics */}
                <div className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Total Models:</span>
                            <span className="stat-value">{items.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Floor Coverage:</span>
                            <span className="stat-value">{totalArea.toFixed(2)} m²</span>
                        </div>

                    </div>

                    {/* Category breakdown */}
                    {Object.keys(categoryStats).length > 0 && (
                        <div className="category-badges">
                            <div className="badges-container">
                                {Object.entries(categoryStats).map(([category, stats]) => (
                                    <span key={category} className="category-badge">
                                        {category}: {stats.count} (${stats.value.toLocaleString()})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Furniture List */}
                {items.length > 0 && (
                    <div className="furniture-list">
                        {items.map((item) => {
                            const typeInfo = getTypeInfo(item.type || "default");
                            return (
                                <div
                                    key={item.id}
                                    className={`furniture-item ${typeInfo.className} ${item.visible === false ? "hidden" : ""
                                        }`}
                                >
                                    {/* Top Row: Image and Action Buttons */}
                                    <div className="item-content-wrapper">
                                        {/* Model preview */}
                                        <div className="item-image">
                                            {item.imagePath ? (
                                                <img
                                                    src={item.imagePath}
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="item-image-fallback"
                                                style={{ display: item.imagePath ? 'none' : 'flex' }}
                                            >
                                                <span>{typeInfo.icon}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="item-actions">
                                            {onToggleVisibility && (
                                                <button
                                                    className="action-btn visibility"
                                                    onClick={() => onToggleVisibility(item.id)}
                                                    title={item.visible === false ? "Show Model" : "Hide Model"}
                                                >
                                                    {item.visible === false ? (
                                                        <EyeOff className="action-icon" />
                                                    ) : (
                                                        <Eye className="action-icon" />
                                                    )}
                                                </button>
                                            )}

                                            <button
                                                className="action-btn rotate"
                                                onClick={() => onRotate(item.id)}
                                                title="Rotate 45°"
                                            >
                                                <RotateCw className="action-icon" />
                                            </button>

                                            <button
                                                className="action-btn remove"
                                                onClick={() => onRemove(item.id)}
                                                title="Remove from room"
                                            >
                                                <Trash2 className="action-icon" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Item Details */}
                                    <div className="item-details">
                                        <h4 className="item-name">{item.name}</h4>

                                        {/* Dimensions and specs */}
                                        {item.dimensions && (
                                            <div className="item-dimensions">
                                                <div className="dimension-info">
                                                    <Ruler className="dimension-icon" />
                                                    <span>
                                                        {item.dimensions.width}×{item.dimensions.depth}×
                                                        {item.dimensions.height}m
                                                    </span>
                                                </div>
                                                <span>•</span>
                                                <span>
                                                    {(item.dimensions.width * item.dimensions.depth).toFixed(2)} m²
                                                </span>
                                            </div>
                                        )}

                                        {/* Material, style and price */}
                                        <div className="item-specs">
                                            <div className="item-materials">
                                                {item.material && (
                                                    <span>{item.material}</span>
                                                )}
                                                {item.style && (
                                                    <>
                                                        {item.material && <span>•</span>}
                                                        <span>{item.style}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="footer">
                    <span>Drag 3D models in the scene to reposition them</span>
                    <div className="footer-info">
                        <span>
                            {items.filter((item) => item.visible !== false).length} visible
                        </span>
                        {loadingState?.cacheSize > 0 && (
                            <>
                                <span>•</span>
                                <span>{loadingState.cacheSize} cached models</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlacedItemsList;