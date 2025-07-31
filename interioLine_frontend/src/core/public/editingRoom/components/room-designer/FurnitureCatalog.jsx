import {
    Archive,
    Bed,
    DollarSign,
    Download,
    Flower2,
    LampDesk,
    Lightbulb,
    Package,
    Sofa,
    Table,
    X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from 'react';
import { furnitureCatalog, getAllCategories, getCategoryStats, getStyleStats, searchFurniture } from "./furniture-Catalog";
import './FurnitureCatalog.css';

const categoryIcons = {
    seating: <Sofa className="category-icon" />,
    tables: <Table className="category-icon" />,
    bedroom: <Bed className="category-icon" />,
    storage: <Archive className="category-icon" />,
    lighting: <Lightbulb className="category-icon" />,
    decoration: <Flower2 className="category-icon" />,
    office: <LampDesk className="category-icon" />,
};

const categoryColors = {
    seating: "primary",
    tables: "success",
    bedroom: "warning",
    storage: "secondary",
    lighting: "warning",
    decoration: "success",
    office: "danger"
};

const FurnitureCatalog = ({
    selectedFurnitureItem,
    setSelectedFurnitureItem,
    addFurnitureToRoom,
    isLoading,
    loadingProgress,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [activeStyle, setActiveStyle] = useState("all");
    const [priceRange, setPriceRange] = useState([0, 1500]);
    const [addingItemId, setAddingItemId] = useState(null);
    const [brokenImages, setBrokenImages] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });
    const containerRef = useRef(null);

    // Filter furniture items with multiple criteria
    const filteredFurniture = useMemo(() => {
        let items = furnitureCatalog;

        // Search filter
        if (searchQuery) {
            items = searchFurniture(searchQuery);
        }

        // Category filter
        if (activeCategory !== "all") {
            items = items.filter(item => item.category === activeCategory);
        }

        // Style filter
        if (activeStyle !== "all") {
            items = items.filter(item => item.style === activeStyle);
        }

        // Price range filter
        items = items.filter(item => {
            const price = item.price || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        return items;
    }, [searchQuery, activeCategory, activeStyle, priceRange]);

    const categories = getAllCategories();
    const categoryStats = getCategoryStats();
    const styleStats = getStyleStats();

    const handleImageError = (itemId) => {
        setBrokenImages(prev => new Set([...prev, itemId]));
    };

    const renderFurnitureImage = (item) => {
        if (brokenImages.has(item.id)) {
            return (
                <div className="image-fallback">
                    <div className="fallback-content">
                        <Package className="fallback-icon" />
                        <div className="fallback-text">{item.type}</div>
                    </div>
                    {/* 3D Model indicator */}
                    {/* <div className="model-indicator">
                        <Download className="model-indicator-icon" />
                        3D
                    </div> */}
                </div>
            );
        }

        return (
            <div className="item-image-container">
                <img
                    src={item.imagePath}
                    alt={item.name}
                    className="item-image"
                    onError={() => handleImageError(item.id)}
                    loading="lazy"
                />
                {/* 3D Model indicator for working images */}
                {/* <div className="model-indicator">
                    <Download className="model-indicator-icon" />
                    3D
                </div> */}
            </div>
        );
    };

    const handleAddFurniture = async (item) => {
        setAddingItemId(item.id);
        try {
            await addFurnitureToRoom(item);
            setSelectedFurnitureItem("");
        } catch (error) {
            console.error("Error adding furniture:", error);
            alert("Failed to load 3D model. Please try again.");
        } finally {
            setAddingItemId(null);
        }
    };

    const selectedItem = furnitureCatalog.find(
        (item) => item.id === selectedFurnitureItem
    );

    const totalCatalogValue = furnitureCatalog.reduce((sum, item) => sum + (item.price || 0), 0);
    const filteredValue = filteredFurniture.reduce((sum, item) => sum + (item.price || 0), 0);

    const resetFilters = () => {
        setSearchQuery("");
        setActiveCategory("all");
        setActiveStyle("all");
        setPriceRange([0, 1500]);
    };

    // Calculate card position when item is selected
    useEffect(() => {
        if (selectedItem && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const sidebarWidth = 450; // Width of sidebar

            setCardPosition({
                top: containerRect.top - 40, // Position from top of viewport
                left: containerRect.left + sidebarWidth + 10, // Position to the right of sidebar with gap
            });
        }
    }, [selectedItem]);

    return (
        <>
            <div className="furniture-catalog-container" ref={containerRef}>

                {/* Search */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search 3D furniture models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="advanced-filters">
                        <div className="filters-header">
                            <h3 className="filters-title">Advanced Filters</h3>
                            <button
                                onClick={resetFilters}
                                className="reset-filters-btn"
                            >
                                Reset All
                            </button>
                        </div>

                        {/* Style Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Style</label>
                            <div className="filter-buttons">
                                <button
                                    onClick={() => setActiveStyle("all")}
                                    className={`filter-btn ${activeStyle === "all" ? "active" : ""}`}
                                >
                                    All Styles
                                </button>
                                {Object.entries(styleStats).map(([style, stats]) => (
                                    <button
                                        key={style}
                                        onClick={() => setActiveStyle(style)}
                                        className={`filter-btn ${activeStyle === style ? "active" : ""}`}
                                        title={`${stats.count} items, avg ${stats.avgPrice}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Category filters */}
                <div className="category-section">
                    <div className="category-buttons">
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`category-btn all ${activeCategory === "all" ? "active" : ""}`}
                        >
                            All ({furnitureCatalog.length})
                        </button>
                        {categories.map((category) => {
                            const stats = categoryStats[category];
                            return (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`category-btn category ${activeCategory === category ? "active" : ""}`}
                                    title={`${stats.count} items`}
                                >
                                    {categoryIcons[category]}
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Results summary */}
                {(searchQuery || activeCategory !== "all" || activeStyle !== "all" || priceRange[0] > 0 || priceRange[1] < 1500) && (
                    <div className="results-summary">
                        <div className="results-info">
                            <span className="results-text">
                                Showing {filteredFurniture.length} of {furnitureCatalog.length} models
                            </span>
                        </div>
                    </div>
                )}

                {/* Debug info for broken images */}
                {brokenImages.size > 0 && (
                    <div className="debug-info">
                        {brokenImages.size} image(s) failed to load. Showing fallback previews.
                    </div>
                )}

                {/* Furniture grid */}
                <div className="furniture-grid">
                    {filteredFurniture.map((item) => (
                        <div
                            key={item.id}
                            className={`furniture-item-card ${selectedFurnitureItem === item.id ? "selected" : ""}`}
                            onClick={() => setSelectedFurnitureItem(item.id)}
                        >
                            {/* Item image */}
                            {renderFurnitureImage(item)}

                            {/* Item info */}
                            <div className="item-info">
                                <h4 className="item-name">
                                    {item.name}
                                </h4>

                                <div className="item-meta" style={{ paddingTop: '5px', marginBottom: '-1px' }}>
                                    <span className={`item-badge ${categoryColors[item.category] || "default"}`}>
                                        {item.type}
                                    </span>
                                    <div className="item-material">
                                        {item.material}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFurniture.length === 0 && (
                    <div className="empty-state">
                        <Package className="empty-state-icon" />
                        <h3 className="empty-state-title">No 3D Models Found</h3>
                        <p className="empty-state-text">
                            No furniture models match your current search criteria.
                        </p>
                        <button
                            onClick={() => {
                                resetFilters();
                            }}
                            className="empty-state-btn"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Item Details Card */}
            {selectedItem && (
                <div
                    className="floating-item-card"
                    style={{
                        position: 'fixed',
                        top: `${cardPosition.top}px`,
                        left: `${cardPosition.left}px`,
                        zIndex: 1000,
                    }}
                >
                    <div className="floating-card-header">
                        <h3 className="floating-card-title">{selectedItem.name}</h3>
                        <button
                            className="floating-card-close"
                            onClick={() => setSelectedFurnitureItem("")}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="floating-card-content">
                        <div className="floating-item-image">
                            {!brokenImages.has(selectedItem.id) && selectedItem.imagePath ? (
                                <img
                                    src={selectedItem.imagePath}
                                    alt={selectedItem.name}
                                    onError={() => handleImageError(selectedItem.id)}
                                />
                            ) : (
                                <div className="floating-image-fallback">
                                    <Package className="fallback-icon" />
                                </div>
                            )}
                        </div>

                        <div className="floating-item-details">
                            {selectedItem.price && (
                                <div className="floating-item-price">
                                    <DollarSign className="price-icon" />
                                    {selectedItem.price}
                                </div>
                            )}

                            <p className="floating-item-description">
                                {selectedItem.description}
                            </p>

                            <div className="floating-item-specs">
                                <div className="spec-row">
                                    <span className="spec-label">Size:</span>
                                    <span className="spec-value">
                                        {selectedItem.dimensions.width} × {selectedItem.dimensions.depth} × {selectedItem.dimensions.height}m
                                    </span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Material:</span>
                                    <span className="spec-value">{selectedItem.material}</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Style:</span>
                                    <span className="spec-value">{selectedItem.style}</span>
                                </div>
                            </div>

                            <button
                                className="floating-add-btn"
                                onClick={() => handleAddFurniture(selectedItem)}
                                disabled={isLoading || addingItemId === selectedItem.id}
                            >
                                {addingItemId === selectedItem.id ? (
                                    <>
                                        <div className="loading-spinner" />
                                        Loading 3D Model...
                                    </>
                                ) : isLoading ? (
                                    <>
                                        <div className="loading-spinner" />
                                        Adding... {Math.round(loadingProgress)}%
                                    </>
                                ) : (
                                    <>
                                        <Download className="btn-icon" />
                                        Add 3D Model to Room
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FurnitureCatalog;