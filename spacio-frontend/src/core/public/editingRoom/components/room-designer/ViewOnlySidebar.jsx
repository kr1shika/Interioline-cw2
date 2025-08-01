import {
    Tab,
    Tabs
} from "@heroui/react";
import {
    ChevronDown,
    ChevronUp,
    Eye,
    Home,
    Package
} from 'lucide-react';
import { useState } from 'react';
import PlacedItemsList from './PlacedItemsList';
import './sidebar.css';

const ViewOnlySidebar = ({
    placedFurniture,
    wallColor,
    floorColor,
    roomArea,
    roomVolume,
    furnitureAreaPercentage,
    totalCost,
    doors,
    windows,
    roomDimensions,
    furnitureLoadingState,
    projectRoomLoaded
}) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Collapsible sections state
    const [dimensionsOpen, setDimensionsOpen] = useState(true);
    const [colorsOpen, setColorsOpen] = useState(true);
    const [doorsOpen, setDoorsOpen] = useState(true);
    const [windowsOpen, setWindowsOpen] = useState(true);
    const [measurementsOpen, setMeasurementsOpen] = useState(false);

    const CollapsibleSection = ({ title, isOpen, onToggle, children, icon }) => (
        <div className="collapsible-section">
            <button
                className="section-toggle"
                onClick={onToggle}
            >
                <h3 className="section-title-collapsible">
                    {icon && <span className="section-icon">{icon}</span>}
                    {title}
                </h3>
                {isOpen ? <ChevronUp className="icon-sm" /> : <ChevronDown className="icon-sm" />}
            </button>
            {isOpen && (
                <div className="section-content">
                    {children}
                </div>
            )}
        </div>
    );

    // Read-only display components
    const ReadOnlyField = ({ label, value, type = "text" }) => (
        <div>
            <label className="input-label">{label}</label>
            <div className="read-only-field">
                {type === "color" ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: value }}
                        ></div>
                        <span className="text-sm text-gray-600">{value}</span>
                    </div>
                ) : (
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                )}
            </div>
        </div>
    );

    const ReadOnlyOpeningsList = ({ items, type }) => (
        <div className="items-list">
            {items && items.length > 0 ? (
                items.map((item) => (
                    <div key={item.id} className="item-card">
                        <div className="item-header">
                            <h4 className="item-title">
                                {type} {item.id.replace(type.toLowerCase(), "")}
                            </h4>
                        </div>
                        <div className="read-only-openings-grid">
                            <ReadOnlyField label="Wall" value={item.wall} />
                            <ReadOnlyField label="Position" value={`${item.position}m`} />
                            <ReadOnlyField label="Width" value={`${item.width}m`} />
                            <ReadOnlyField label="Height" value={`${item.height}m`} />
                            {item.sillHeight && (
                                <ReadOnlyField label="Sill Height" value={`${item.sillHeight}m`} />
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p className="empty-message">No {type.toLowerCase()}s in this room</p>
            )}
        </div>
    );

    if (!projectRoomLoaded) {
        return (
            <div className="sidebar">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Room View</h2>
                </div>

                <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Room Not Loaded</h3>
                    <p className="text-sm text-gray-500">
                        Click "Load Project Room" to view the room design
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="sidebar">
            <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Room Overview</h2>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">View Only</span>
            </div>

            <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key)}
                variant="underlined"
                classNames={{
                    tabList: "gap-2 w-full bg-gray-100 rounded-lg p-1",
                    cursor: "bg-blue-500 rounded-md",
                    tab: "px-3 py-2 h-auto rounded-md transition-all duration-200",
                    tabContent: "text-sm font-medium"
                }}
            >
                <Tab
                    key="overview"
                    title={
                        <div className="flex items-center gap-2">
                            <Home className="icon-sm" />
                            <span>Room Details</span>
                        </div>
                    }
                >
                    <div className="tab-content-spacing">
                        {/* Room Dimensions Section */}
                        {/* <CollapsibleSection
                            title="Room Dimensions"
                            isOpen={dimensionsOpen}
                            onToggle={() => setDimensionsOpen(!dimensionsOpen)}
                            icon={<Ruler className="icon-sm" />}
                        >
                            <div className="dimensions-grid">
                                <ReadOnlyField 
                                    label="Width" 
                                    value={`${roomDimensions?.width || 0}m`} 
                                />
                                <ReadOnlyField 
                                    label="Length" 
                                    value={`${roomDimensions?.length || 0}m`} 
                                />
                                <ReadOnlyField 
                                    label="Height" 
                                    value={`${roomDimensions?.height || 0}m`} 
                                />
                            </div>
                        </CollapsibleSection> */}

                        {/* Colors Section */}
                        <CollapsibleSection
                            title="Colors & Materials"
                            isOpen={colorsOpen}
                            onToggle={() => setColorsOpen(!colorsOpen)}
                            icon={<div className="icon-sm color-palette-icon">🎨</div>}
                        >
                            <div className="color-grid">
                                <ReadOnlyField
                                    label="Wall Color"
                                    value={wallColor || "#f8f8f8"}
                                    type="color"
                                />
                                <ReadOnlyField
                                    label="Floor Color"
                                    value={floorColor || "#d4b896"}
                                    type="color"
                                />
                            </div>
                        </CollapsibleSection>

                        {/* Doors Section */}
                        <CollapsibleSection
                            title={`Doors (${doors?.length || 0})`}
                            isOpen={doorsOpen}
                            onToggle={() => setDoorsOpen(!doorsOpen)}
                            icon={<Home className="icon-sm" />}
                        >
                            <ReadOnlyOpeningsList items={doors} type="Door" />
                        </CollapsibleSection>

                        {/* Windows Section */}
                        <CollapsibleSection
                            title={`Windows (${windows?.length || 0})`}
                            isOpen={windowsOpen}
                            onToggle={() => setWindowsOpen(!windowsOpen)}
                            icon={<Home className="icon-sm" />}
                        >
                            <ReadOnlyOpeningsList items={windows} type="Window" />
                        </CollapsibleSection>


                    </div>
                </Tab>
{/* 
                <Tab
                    key="furniture"
                    title={
                        <div className="flex items-center gap-2">
                            <Package className="icon-sm" />
                            <span>Furniture</span>
                        </div>
                    }
                >
                    <div className="furniture-tab">
                        {placedFurniture && placedFurniture.length > 0 ? (
                            <div className="view-only-furniture-info">
                                <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="font-medium text-blue-800 mb-1">Furniture Information</p>
                                    <p>This room contains {placedFurniture.length} furniture items. You can view their details below, but modifications require designer access.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No Furniture Yet</h3>
                                <p className="text-sm text-gray-500">
                                    The designer hasn't added any furniture to this room yet.
                                </p>
                            </div>
                        )}
                    </div>
                </Tab> */}
            </Tabs>

            {/* Placed Furniture List - View Only */}
            {placedFurniture && placedFurniture.length > 0 && (
                <PlacedItemsList
                    items={placedFurniture}
                    onRotate={null} // Disable rotation in view-only mode
                    onRemove={null} // Disable removal in view-only mode
                    onClearAll={null} // Disable clear all in view-only mode
                    onToggleVisibility={null} // Disable visibility toggle in view-only mode
                    loadingState={furnitureLoadingState}
                    viewOnly={true} // Add view-only flag
                />
            )}
        </div>
    );
};

export default ViewOnlySidebar;