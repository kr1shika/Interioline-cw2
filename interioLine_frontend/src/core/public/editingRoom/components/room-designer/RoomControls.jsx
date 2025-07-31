

import { Badge, Button, Card, CardBody, Tab, Tabs } from "@heroui/react";
import {
  Home,
  Layers,
  Palette,
  Plus,
  Settings,
  Sun,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  carpets,
  floorColors,
  lightingOptions,
  wallColors,
  wallTextures,
} from "./ColorsandTextures";









const RoomControls = ({
  roomDimensions,
  setRoomDimensions,
  doors,
  windows,
  onAddDoor,
  onAddWindow,
  onUpdateDoor,
  onUpdateWindow,
  onRemoveDoor,
  onRemoveWindow,
  wallColor,
  setWallColor,
  floorColor,
  setFloorColor,
  wallTexture,
  setWallTexture,
  onAddCarpet,
  carpetsInRoom,
  onRemoveCarpet,
  viewMode,
  setViewMode,
}) => {
  const [activeTab, setActiveTab] = useState("walls");
  const [wallColorCategory, setWallColorCategory] = useState("all");
  const [floorCategory, setFloorCategory] = useState("all");
  const [selectedLighting, setSelectedLighting] = useState(lightingOptions[1]);

  // Filter colors by category
  const filteredWallColors =
    wallColorCategory === "all"
      ? wallColors
      : wallColors.filter((color) => color.category === wallColorCategory);

  const filteredFloorColors =
    floorCategory === "all"
      ? floorColors
      : floorColors.filter((color) => color.category === floorCategory);

  // Get unique categories
  const wallCategories = Array.from(
    new Set(wallColors.map((color) => color.category))
  );
  const floorCategories = Array.from(
    new Set(floorColors.map((color) => color.category))
  );

  const renderColorPalette = (
    colors,
    selectedColor,
    onColorSelect,
    size = "md"
  ) => (
    <div
      className={`grid gap-2 ${size === "sm" ? "grid-cols-8" : "grid-cols-6"}`}
    >
      {colors.map((colorOption) => (
        <button
          key={colorOption.value}
          className={`aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-110 ${selectedColor === colorOption.value
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-gray-300 hover:border-gray-400"
            }`}
          style={{ backgroundColor: colorOption.value }}
          onClick={() => onColorSelect(colorOption.value)}
          title={colorOption.name}
        >
          {selectedColor === colorOption.value && (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white drop-shadow-lg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Room Settings</h2>
      </div>

      {/* View Mode Toggle */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">View Mode</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "orbit"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setViewMode("orbit")}
              >
                Orbit
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "first-person"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => setViewMode("first-person")}
              >
                First Person
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key)}
        variant="underlined"
        classNames={{
          tabList: "gap-4 w-full",
          cursor: "bg-blue-500",
          tab: "px-0 h-12",
        }}
      >
        <Tab
          key="walls"
          title={
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Walls</span>
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Wall Colors
                </h3>
                <input
                  type="color"
                  value={wallColor}
                  onChange={(e) => setWallColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  title="Custom color picker"
                />
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <button
                  onClick={() => setWallColorCategory("all")}
                  className={`px-2 py-1 text-xs rounded transition-colors ${wallColorCategory === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  All
                </button>
                {wallCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setWallColorCategory(category)}
                    className={`px-2 py-1 text-xs rounded capitalize transition-colors ${wallColorCategory === category
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {renderColorPalette(filteredWallColors, wallColor, setWallColor)}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Wall Texture
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {wallTextures.map((texture) => (
                  <button
                    key={texture.id}
                    className={`p-3 border rounded-lg text-left transition-all hover:shadow-sm ${wallTexture === texture.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => setWallTexture(texture.id)}
                  >
                    <div className="font-medium text-sm">{texture.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {texture.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Tab>

        <Tab
          key="floors"
          title={
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Floors</span>
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Floor Materials
                </h3>
                <input
                  type="color"
                  value={floorColor}
                  onChange={(e) => setFloorColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  title="Custom color picker"
                />
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <button
                  onClick={() => setFloorCategory("all")}
                  className={`px-2 py-1 text-xs rounded transition-colors ${floorCategory === "all"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  All
                </button>
                {floorCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFloorCategory(category)}
                    className={`px-2 py-1 text-xs rounded capitalize transition-colors ${floorCategory === category
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {filteredFloorColors.map((floor) => (
                  <button
                    key={floor.value}
                    className={`relative border rounded-lg overflow-hidden transition-all hover:shadow-md ${floorColor === floor.value
                      ? "ring-2 ring-green-500 border-green-500"
                      : "border-gray-200"
                      }`}
                    onClick={() => setFloorColor(floor.value)}
                  >
                    <div
                      className="h-16 w-full"
                      style={{ backgroundColor: floor.value }}
                    ></div>
                    <div className="p-2 bg-white">
                      <p className="font-medium text-xs">{floor.name}</p>
                      <Badge
                        size="sm"
                        variant="flat"
                        className="text-xs capitalize mt-1"
                      >
                        {floor.category}
                      </Badge>
                    </div>
                    {floorColor === floor.value && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                        <svg
                          className="w-3 h-3 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Tab>

        <Tab
          key="carpets"
          title={
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Carpets</span>
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Available Carpets & Rugs
              </h3>
              <Badge variant="flat" color="primary">
                {carpets.length} styles
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {carpets.map((carpet) => (
                <button
                  key={carpet.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-all group"
                  onClick={() => onAddCarpet(carpet)}
                >
                  <div className="relative">
                    <img
                      src={carpet.texture}
                      alt={carpet.name}
                      className="w-full h-20 object-cover"
                      onError={(e) => {
                        // Fallback to color background if image fails
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget
                          .nextElementSibling;
                        if (fallback) fallback.style.display = "block";
                      }}
                    />
                    <div
                      className="w-full h-20 hidden"
                      style={{ backgroundColor: carpet.color }}
                    ></div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="font-medium text-xs leading-tight">
                      {carpet.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge size="sm" variant="flat" className="text-xs">
                        {carpet.style}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {carpet.dimensions.width}×{carpet.dimensions.depth}m
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {carpetsInRoom && carpetsInRoom.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Carpets in Room
                  </h4>
                  <Badge variant="flat">{carpetsInRoom.length}</Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {carpetsInRoom.map((carpet) => (
                    <div
                      key={carpet.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: carpet.color }}
                        ></div>
                        <span className="text-xs font-medium">
                          {carpet.name}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveCarpet(carpet.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Remove carpet"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Tab>

        <Tab
          key="lighting"
          title={
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <span>Lighting</span>
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-medium text-gray-700">
              Lighting Settings
            </h3>

            <div className="grid gap-3">
              {lightingOptions.map((option) => (
                <button
                  key={option.name}
                  className={`p-3 border rounded-lg text-left transition-all ${selectedLighting.name === option.name
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  onClick={() => setSelectedLighting(option)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{option.name}</div>
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {option.temperature}K
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Tab>

        <Tab
          key="openings"
          title={
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Doors & Windows</span>
            </div>
          }
        >
          <div className="space-y-6 pt-4">
            {/* Doors Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Doors</h3>
                <Button
                  size="sm"
                  color="primary"
                  onPress={onAddDoor}
                  startContent={<Plus className="w-4 h-4" />}
                >
                  Add Door
                </Button>
              </div>

              {doors.length > 0 ? (
                <div className="space-y-3">
                  {doors.map((door) => (
                    <Card key={door.id} className="shadow-sm">
                      <CardBody className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">
                            Door {door.id.replace("door", "")}
                          </h4>
                          <button
                            onClick={() => onRemoveDoor(door.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-gray-600 mb-1">
                              Wall
                            </label>
                            <select
                              value={door.wall}
                              onChange={(e) =>
                                onUpdateDoor(door.id, { wall: e.target.value })
                              }
                              className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            >
                              <option value="north">North</option>
                              <option value="east">East</option>
                              <option value="south">South</option>
                              <option value="west">West</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-600 mb-1">
                              Position (m)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={door.position}
                              onChange={(e) =>
                                onUpdateDoor(door.id, {
                                  position: parseFloat(e.target.value),
                                })
                              }
                              className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-600 mb-1">
                              Width (m)
                            </label>
                            <input
                              type="number"
                              min="0.6"
                              max="2"
                              step="0.1"
                              value={door.width}
                              onChange={(e) =>
                                onUpdateDoor(door.id, {
                                  width: parseFloat(e.target.value),
                                })
                              }
                              className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-600 mb-1">
                              Height (m)
                            </label>
                            <input
                              type="number"
                              min="1.8"
                              max="3"
                              step="0.1"
                              value={door.height}
                              onChange={(e) =>
                                onUpdateDoor(door.id, {
                                  height: parseFloat(e.target.value),
                                })
                              }
                              className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No doors added yet
                </p>
              )}
            </div>

            {/* Windows Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Windows</h3>
                <Button
                  size="sm"
                  color="primary"
                  onPress={onAddWindow}
                  startContent={<Plus className="w-4 h-4" />}
                >
                  Add Window
                </Button>
              </div>

              {windows.length > 0 ? (
                <div className="space-y-3">
                  {windows.map((window) => (
                    <Card key={window.id} className="shadow-sm">
                      <CardBody className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">
                            Window {window.id.replace("window", "")}
                          </h4>
                          <button
                            onClick={() => onRemoveWindow(window.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-gray-600 mb-1">
                              Wall
                            </label>
                            <select
                              value={window.wall}
                              onChange={(e) =>
                                onUpdateWindow(window.id, {
                                  wall: e.target.value,
                                })
                              }
                              className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            >
                              <option value="north">North</option>
                              <option value="east">East</option>
                              <option value="south">South</option>
                              <option value="west">West</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-600 mb-1">
                              Position (m)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={window.position}
                              onChange={(e) =>
                                onUpdateWindow(window.id, {
                                  position: parseFloat(e.target.value),
                                })
                              }
                              className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-600 mb-1">
                              Width (m)
                            </label>
                            <input
                              type="number"
                              min="0.4"
                              max="3"
                              step="0.1"
                              value={window.width}
                              onChange={(e) =>
                                onUpdateWindow(window.id, {
                                  width: parseFloat(e.target.value),
                                })
                              }
                              className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-600 mb-1">
                              Height (m)
                            </label>
                            <input
                              type="number"
                              min="0.4"
                              max="2.5"
                              step="0.1"
                              value={window.height}
                              onChange={(e) =>
                                onUpdateWindow(window.id, {
                                  height: parseFloat(e.target.value),
                                })
                              }
                              className="w-full p-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No windows added yet
                </p>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};