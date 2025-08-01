import { Plus, Trash2 } from 'lucide-react';
import './sidebar.css';

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
        width: 7,
        length: 8,
        height: 6,
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

const RoomSettings = ({
    selectedRoomType = ROOM_PRESETS[1], // Default fallback
    setSelectedRoomType,
    roomDimensions = { width: 7, length: 8, height: 6 }, // Default fallback
    setRoomDimensions,
    wallColor = "#f8f8f8", // Default fallback
    setWallColor,
    floorColor = "#d4b896", // Default fallback
    setFloorColor,
    doors = [], // Default fallback
    windows = [], // Default fallback
    handleAddDoor,
    handleUpdateDoor,
    handleRemoveDoor,
    handleAddWindow,
    handleUpdateWindow,
    handleRemoveWindow
}) => {
    // Ensure we have valid data before rendering
    const safeRoomDimensions = roomDimensions || { width: 7, length: 8, height: 6 };
    const safeSelectedRoomType = selectedRoomType || ROOM_PRESETS[1];

    return (
        <div className="room-settings">
            {/* Room Type and Size */}
            {/* <div className="setting-group">
                <label className="setting-label">Room Type & Size</label>
                <select
                    value={ROOM_PRESETS.findIndex(room =>
                        room.name === safeSelectedRoomType.name) || 1}
                    onChange={(e) => {
                        const selectedPreset = ROOM_PRESETS[parseInt(e.target.value)];
                        if (setSelectedRoomType && selectedPreset) {
                            setSelectedRoomType(selectedPreset);
                        }
                    }}
                    className="room-preset-select"
                >
                    {ROOM_PRESETS.map((room, index) => (
                        <option key={index} value={index}>
                            {room.name} ({room.width}m × {room.length}m)
                        </option>
                    ))}
                </select>
            </div> */}

            {/* Custom Dimensions */}
            <div className="setting-group">
                <label className="setting-label">Custom Dimensions</label>
                <div className="dimensions-grid">
                    <div className="dimension-input">
                        <label className="dimension-label">Width (m)</label>
                        <input
                            type="number"
                            min="2"
                            max="20"
                            step="0.1"
                            value={safeRoomDimensions.width || 7}
                            onChange={(e) => {
                                if (setRoomDimensions) {
                                    setRoomDimensions(prev => ({
                                        ...prev,
                                        width: parseFloat(e.target.value) || 7,
                                    }));
                                }
                            }}
                            className="dimension-field"
                        />
                    </div>
                    <div className="dimension-input">
                        <label className="dimension-label">Length (m)</label>
                        <input
                            type="number"
                            min="2"
                            max="20"
                            step="0.1"
                            value={safeRoomDimensions.length || 8}
                            onChange={(e) => {
                                if (setRoomDimensions) {
                                    setRoomDimensions(prev => ({
                                        ...prev,
                                        length: parseFloat(e.target.value) || 8,
                                    }));
                                }
                            }}
                            className="dimension-field"
                        />
                    </div>
                    <div className="dimension-input">
                        <label className="dimension-label">Height (m)</label>
                        <input
                            type="number"
                            min="2"
                            max="4"
                            step="0.1"
                            value={safeRoomDimensions.height || 6}
                            onChange={(e) => {
                                if (setRoomDimensions) {
                                    setRoomDimensions(prev => ({
                                        ...prev,
                                        height: parseFloat(e.target.value) || 6,
                                    }));
                                }
                            }}
                            className="dimension-field"
                        />
                    </div>
                </div>
            </div>

            {/* Colors */}
            <div className="setting-group">
                <label className="setting-label">Colors</label>
                <div className="color-controls">
                    <div className="color-control">
                        <label className="color-label">Wall Color</label>
                        <input
                            type="color"
                            value={wallColor || "#f8f8f8"}
                            onChange={(e) => {
                                if (setWallColor) {
                                    setWallColor(e.target.value);
                                }
                            }}
                            className="color-picker"
                        />
                    </div>
                    <div className="color-control">
                        <label className="color-label">Floor Color</label>
                        <input
                            type="color"
                            value={floorColor || "#d4b896"}
                            onChange={(e) => {
                                if (setFloorColor) {
                                    setFloorColor(e.target.value);
                                }
                            }}
                            className="color-picker"
                        />
                    </div>
                </div>
            </div>

            {/* Doors Section */}
            <div className="openings-section">
                <div className="opening-header">
                    <h3 className="opening-title">Doors</h3>
                    <button
                        onClick={handleAddDoor}
                        className="add-button"
                        disabled={!handleAddDoor}
                    >
                        <Plus className="w-4 h-4" />
                        Add Door
                    </button>
                </div>

                {doors && doors.length > 0 ? (
                    <div className="opening-list">
                        {doors.map((door) => (
                            <div key={door.id} className="opening-item">
                                <div className="opening-item-header">
                                    <h4 className="opening-item-title">
                                        Door {door.id.replace("door", "")}
                                    </h4>
                                    <button
                                        onClick={() => handleRemoveDoor && handleRemoveDoor(door.id)}
                                        className="remove-button"
                                        disabled={!handleRemoveDoor}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="opening-controls">
                                    <div className="opening-control">
                                        <label className="opening-label">Wall</label>
                                        <select
                                            value={door.wall || "north"}
                                            onChange={(e) =>
                                                handleUpdateDoor && handleUpdateDoor(door.id, { wall: e.target.value })
                                            }
                                            className="opening-select"
                                            disabled={!handleUpdateDoor}
                                        >
                                            <option value="north">North</option>
                                            <option value="east">East</option>
                                            <option value="south">South</option>
                                            <option value="west">West</option>
                                        </select>
                                    </div>

                                    <div className="opening-control">
                                        <label className="opening-label">Position (m)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={door.position || 0}
                                            onChange={(e) =>
                                                handleUpdateDoor && handleUpdateDoor(door.id, {
                                                    position: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            className="opening-input"
                                            disabled={!handleUpdateDoor}
                                        />
                                    </div>

                                    <div className="opening-control">
                                        <label className="opening-label">Width (m)</label>
                                        <input
                                            type="number"
                                            min="0.6"
                                            max="2"
                                            step="0.1"
                                            value={door.width || 0.9}
                                            onChange={(e) =>
                                                handleUpdateDoor && handleUpdateDoor(door.id, {
                                                    width: parseFloat(e.target.value) || 0.9,
                                                })
                                            }
                                            className="opening-input"
                                            disabled={!handleUpdateDoor}
                                        />
                                    </div>

                                    <div className="opening-control">
                                        <label className="opening-label">Height (m)</label>
                                        <input
                                            type="number"
                                            min="1.8"
                                            max="3"
                                            step="0.1"
                                            value={door.height || 2.1}
                                            onChange={(e) =>
                                                handleUpdateDoor && handleUpdateDoor(door.id, {
                                                    height: parseFloat(e.target.value) || 2.1,
                                                })
                                            }
                                            className="opening-input"
                                            disabled={!handleUpdateDoor}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-state">No doors added yet</p>
                )}
            </div>

            {/* Windows Section */}
            <div className="openings-section">
                <div className="opening-header">
                    <h3 className="opening-title">Windows</h3>
                    <button
                        onClick={handleAddWindow}
                        className="add-button"
                        disabled={!handleAddWindow}
                    >
                        <Plus className="w-4 h-4" />
                        Add Window
                    </button>
                </div>

                {windows && windows.length > 0 ? (
                    <div className="opening-list">
                        {windows.map((window) => (
                            <div key={window.id} className="opening-item">
                                <div className="opening-item-header">
                                    <h4 className="opening-item-title">
                                        Window {window.id.replace("window", "")}
                                    </h4>
                                    <button
                                        onClick={() => handleRemoveWindow && handleRemoveWindow(window.id)}
                                        className="remove-button"
                                        disabled={!handleRemoveWindow}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="opening-controls">
                                    <div className="opening-control">
                                        <label className="opening-label">Wall</label>
                                        <select
                                            value={window.wall || "north"}
                                            onChange={(e) =>
                                                handleUpdateWindow && handleUpdateWindow(window.id, { wall: e.target.value })
                                            }
                                            className="opening-select"
                                            disabled={!handleUpdateWindow}
                                        >
                                            <option value="north">North</option>
                                            <option value="east">East</option>
                                            <option value="south">South</option>
                                            <option value="west">West</option>
                                        </select>
                                    </div>

                                    <div className="opening-control">
                                        <label className="opening-label">Position (m)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={window.position || 0}
                                            onChange={(e) =>
                                                handleUpdateWindow && handleUpdateWindow(window.id, {
                                                    position: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            className="opening-input"
                                            disabled={!handleUpdateWindow}
                                        />
                                    </div>

                                    <div className="opening-control">
                                        <label className="opening-label">Width (m)</label>
                                        <input
                                            type="number"
                                            min="0.4"
                                            max="3"
                                            step="0.1"
                                            value={window.width || 1.2}
                                            onChange={(e) =>
                                                handleUpdateWindow && handleUpdateWindow(window.id, {
                                                    width: parseFloat(e.target.value) || 1.2,
                                                })
                                            }
                                            className="opening-input"
                                            disabled={!handleUpdateWindow}
                                        />
                                    </div>

                                    <div className="opening-control">
                                        <label className="opening-label">Height (m)</label>
                                        <input
                                            type="number"
                                            min="0.4"
                                            max="2.5"
                                            step="0.1"
                                            value={window.height || 1.2}
                                            onChange={(e) =>
                                                handleUpdateWindow && handleUpdateWindow(window.id, {
                                                    height: parseFloat(e.target.value) || 1.2,
                                                })
                                            }
                                            className="opening-input"
                                            disabled={!handleUpdateWindow}
                                        />
                                    </div>

                                    <div className="opening-control full-width">
                                        <label className="opening-label">Sill Height (m)</label>
                                        <input
                                            type="number"
                                            min="0.3"
                                            max="1.5"
                                            step="0.1"
                                            value={window.sillHeight || 0.9}
                                            onChange={(e) =>
                                                handleUpdateWindow && handleUpdateWindow(window.id, {
                                                    sillHeight: parseFloat(e.target.value) || 0.9,
                                                })
                                            }
                                            className="opening-input"
                                            disabled={!handleUpdateWindow}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-state">No windows added yet</p>
                )}
            </div>
        </div>
    );
};

export default RoomSettings;