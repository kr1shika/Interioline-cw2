import {
    Button,
    Tab,
    Tabs
} from "@heroui/react";
import { ChevronDown, ChevronUp, Home, Package, Ruler, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import FurnitureCatalog from './FurnitureCatalog';
import PlacedItemsList from './PlacedItemsList';
import './sidebar.css';

const Sidebar = ({
    // Room Settings Props
    selectedRoomType,
    setSelectedRoomType,
    roomDimensions,
    setRoomDimensions,
    wallColor,
    setWallColor,
    floorColor,
    setFloorColor,
    doors,
    windows,
    handleAddDoor,
    handleUpdateDoor,
    handleRemoveDoor,
    handleAddWindow,
    handleUpdateWindow,
    handleRemoveWindow,

    // Measurements Props
    roomArea,
    roomVolume,
    furnitureAreaPercentage,
    totalCost,

    // Furniture Props
    selectedFurnitureItem,
    setSelectedFurnitureItem,
    addFurnitureToRoom,
    placedFurniture,
    rotateFurnitureItem,
    removeFurnitureItem,
    clearAllFurniture,
    furnitureLoadingState,

    // Loading Props
    isLoading,
    loadingProgress
}) => {
    const [activeTab, setActiveTab] = useState('basic');

    // Collapsible sections state
    const [roomTypeOpen, setRoomTypeOpen] = useState(true);
    const [dimensionsOpen, setDimensionsOpen] = useState(true);
    const [colorsOpen, setColorsOpen] = useState(true);
    const [doorsOpen, setDoorsOpen] = useState(false);  // Keep closed initially
    const [windowsOpen, setWindowsOpen] = useState(false);  // Keep closed initially
    const [measurementsOpen, setMeasurementsOpen] = useState(false);

    const ROOM_PRESETS = [
        {
            name: "Small Bedroom",
            width: 3,
            length: 3.5,
            height: 2.7,
            type: "bedroom",
        },
        {
            name: "Medium Living Room",
            width: 7, length: 8, height: 6,
            type: "living",
        },
        {
            name: "Large Living Room",
            width: 6,
            length: 8,
            height: 3.2,
            type: "living",
        },
        { name: "Home Office", width: 3.5, length: 4, height: 2.7, type: "office" },
        { name: "Dining Room", width: 4, length: 5, height: 2.7, type: "dining" },
    ];

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

    return (
        <div className="sidebar">
            <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key)}
                variant="underlined"

            >
                <Tab
                    key="basic"
                    title={
                        <div className="flex items-center gap-2">
                            <Home className="icon-sm" />
                            <span>Room Design</span>
                        </div>
                    }
                >
                    <div className="tab-content-spacing">


                        {/* Custom Dimensions Section */}
                        <CollapsibleSection
                            title="Custom Dimensions"
                            isOpen={dimensionsOpen}
                            onToggle={() => setDimensionsOpen(!dimensionsOpen)}
                            icon={<Ruler className="icon-sm" />}
                        >
                            <div className="dimensions-grid">
                                <div>
                                    <label className="input-label">
                                        Width (m)
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="20"
                                        step="0.1"
                                        value={roomDimensions.width}
                                        onChange={(e) =>
                                            setRoomDimensions((prev) => ({
                                                ...prev,
                                                width: parseFloat(e.target.value),
                                            }))
                                        }
                                        className="dimension-input"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">
                                        Length (m)
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="20"
                                        step="0.1"
                                        value={roomDimensions.length}
                                        onChange={(e) =>
                                            setRoomDimensions((prev) => ({
                                                ...prev,
                                                length: parseFloat(e.target.value),
                                            }))
                                        }
                                        className="dimension-input"
                                    />
                                </div>
                                <div>
                                    <label className="input-label">
                                        Height (m)
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="4"
                                        step="0.1"
                                        value={roomDimensions.height}
                                        onChange={(e) =>
                                            setRoomDimensions((prev) => ({
                                                ...prev,
                                                height: parseFloat(e.target.value),
                                            }))
                                        }
                                        className="dimension-input"
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Colors Section */}
                        <CollapsibleSection
                            title="Colors & Materials"
                            isOpen={colorsOpen}
                            onToggle={() => setColorsOpen(!colorsOpen)}
                            icon={<div className="icon-sm color-palette-icon">🎨</div>}
                        >
                            <div className="color-grid">
                                <div>
                                    <label className="input-label">
                                        Wall Color
                                    </label>
                                    <input
                                        type="color"
                                        value={wallColor}
                                        onChange={(e) => setWallColor(e.target.value)}
                                        className="color-input"
                                    />
                                </div>
                                <div>
                                    <label className="input-label secondary">
                                        Floor Color
                                    </label>
                                    <input
                                        type="color"
                                        value={floorColor}
                                        onChange={(e) => setFloorColor(e.target.value)}
                                        className="color-input"
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Doors Section */}
                        <CollapsibleSection
                            title={`Doors (${doors?.length || 0})`}
                            isOpen={doorsOpen}
                            onToggle={() => setDoorsOpen(!doorsOpen)}
                            icon={<SettingsIcon className="icon-sm" />}
                        >
                            <div className="section-header-compact">
                                <Button
                                    size="sm"
                                    color="primary"
                                    onPress={handleAddDoor}
                                    className="add-element-btn"
                                >
                                    <div className="h-80 flex w-full m-auto">+ Add Door</div>
                                </Button>
                            </div>

                            {doors && doors.length > 0 ? (
                                <div className="items-list">
                                    {doors.map((door) => (
                                        <div key={door.id} className="item-card">
                                            <div className="item-header">
                                                <h4 className="item-title">
                                                    Door {door.id.replace("door", "")}
                                                </h4>
                                                <button
                                                    onClick={() => handleRemoveDoor(door.id)}
                                                    className="remove-btn"
                                                >
                                                    <div className="icon-sm">×</div>
                                                </button>
                                            </div>

                                            <div className="controls-grid">
                                                <div>
                                                    <label className="control-label">
                                                        Wall
                                                    </label>
                                                    <select
                                                        value={door.wall}
                                                        onChange={(e) =>
                                                            handleUpdateDoor(door.id, {
                                                                wall: e.target.value,
                                                            })
                                                        }
                                                        className="control-select"
                                                    >
                                                        <option value="north">North</option>
                                                        <option value="east">East</option>
                                                        <option value="south">South</option>
                                                        <option value="west">West</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="control-label">
                                                        Position (m)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        value={door.position}
                                                        onChange={(e) =>
                                                            handleUpdateDoor(door.id, {
                                                                position: parseFloat(e.target.value),
                                                            })
                                                        }
                                                        className="control-input"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="control-label">
                                                        Width (m)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0.6"
                                                        max="2"
                                                        step="0.1"
                                                        value={door.width}
                                                        onChange={(e) =>
                                                            handleUpdateDoor(door.id, {
                                                                width: parseFloat(e.target.value),
                                                            })
                                                        }
                                                        className="control-input"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="control-label">
                                                        Height (m)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1.8"
                                                        max="3"
                                                        step="0.1"
                                                        value={door.height}
                                                        onChange={(e) =>
                                                            handleUpdateDoor(door.id, {
                                                                height: parseFloat(e.target.value),
                                                            })
                                                        }
                                                        className="control-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-message">
                                    No doors added yet. Click "Add Door" to get started.
                                </p>
                            )}
                        </CollapsibleSection>

                        {/* Windows Section */}
                        <CollapsibleSection
                            title={`Windows (${windows?.length || 0})`}
                            isOpen={windowsOpen}
                            onToggle={() => setWindowsOpen(!windowsOpen)}
                            icon={<SettingsIcon className="icon-sm" />}
                        >
                            <div className="section-header-compact">
                                <Button
                                    size="sm"
                                    color="primary"
                                    onPress={handleAddWindow}
                                    className="add-element-btn"
                                >
                                    <div className="h-80 flex w-full m-auto">+ Add Window</div>
                                </Button>
                            </div>

                            {windows && windows.length > 0 ? (
                                <div className="items-list">
                                    {windows.map((window) => (
                                        <div key={window.id} className="item-card">
                                            <div className="item-header">
                                                <h4 className="item-title">
                                                    Window {window.id.replace("window", "")}
                                                </h4>
                                                <button
                                                    onClick={() => handleRemoveWindow(window.id)}
                                                    className="remove-btn"
                                                >
                                                    <div className="icon-sm">×</div>
                                                </button>
                                            </div>

                                            <div className="controls-grid">
                                                <div>
                                                    <label className="control-label">
                                                        Wall
                                                    </label>
                                                    <select
                                                        value={window.wall}
                                                        onChange={(e) =>
                                                            handleUpdateWindow(window.id, {
                                                                wall: e.target.value,
                                                            })
                                                        }
                                                        className="control-select"
                                                    >
                                                        <option value="north">North</option>
                                                        <option value="east">East</option>
                                                        <option value="south">South</option>
                                                        <option value="west">West</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="control-label">
                                                        Position (m)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        value={window.position}
                                                        onChange={(e) =>
                                                            handleUpdateWindow(window.id, {
                                                                position: parseFloat(e.target.value),
                                                            })
                                                        }
                                                        className="control-input"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="control-label">
                                                        Width (m)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0.4"
                                                        max="3"
                                                        step="0.1"
                                                        value={window.width}
                                                        onChange={(e) =>
                                                            handleUpdateWindow(window.id, {
                                                                width: parseFloat(e.target.value),
                                                            })
                                                        }
                                                        className="control-input"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="control-label">
                                                        Height (m)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0.4"
                                                        max="2.5"
                                                        step="0.1"
                                                        value={window.height}
                                                        onChange={(e) =>
                                                            handleUpdateWindow(window.id, {
                                                                height: parseFloat(e.target.value),
                                                            })
                                                        }
                                                        className="control-input"
                                                    />
                                                </div>

                                                <div className="full-width">
                                                    <label className="control-label">
                                                        Sill Height (m)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0.3"
                                                        max="1.5"
                                                        step="0.1"
                                                        value={window.sillHeight}
                                                        onChange={(e) =>
                                                            handleUpdateWindow(window.id, {
                                                                sillHeight: parseFloat(e.target.value),
                                                            })
                                                        }
                                                        className="control-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-message">
                                    No windows added yet. Click "Add Window" to get started.
                                </p>
                            )}
                        </CollapsibleSection>


                    </div>
                </Tab>

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
                        <FurnitureCatalog
                            selectedFurnitureItem={selectedFurnitureItem}
                            setSelectedFurnitureItem={setSelectedFurnitureItem}
                            addFurnitureToRoom={addFurnitureToRoom}
                            isLoading={furnitureLoadingState?.isLoading || isLoading}
                            loadingProgress={furnitureLoadingState?.progress || loadingProgress}
                        />
                    </div>
                </Tab>
            </Tabs>

            {/* Placed Furniture List */}
            {placedFurniture && placedFurniture.length > 0 && (
                <PlacedItemsList
                    items={placedFurniture}
                    onRotate={rotateFurnitureItem}
                    onRemove={removeFurnitureItem}
                    onClearAll={clearAllFurniture}
                    loadingState={furnitureLoadingState}
                />
            )}
        </div>
    );
};

export default Sidebar;