import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@heroui/react";
import {
  FileText,
  FolderOpen,
  Package,
  Save,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthPromptModal from "../../../../../components/AuthPromptModal";
import AuthPopup from "../../../authComponent";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Header from "../../../../../components/header.jsx";
import { useAuth } from "../../../../../provider/authcontext";
import Footer from "../../../../../components/footer.jsx";
import "./CustomRoomDesigner.css";
import Sidebar from "./sidebar.jsx";

import { useFurniturePlacement } from "../hooks/useFurniturePlacement";
import { useRoomMeasurements } from "../hooks/useRoomMeasurements";
import { useRoomScene } from "../hooks/useRoomScene";
import {
  calculateTotalCost,
  deleteRoomConfiguration,
  getRoomConfigurationByProjectId,
  getSavedRoomConfigurations,
  saveRoomConfigurationWithGLB,
  sendRoomToBackend,
  serializeGLBData
} from "./furniture-Catalog";

const CustomRoomDesigner = () => {
  const [projectInfo, setProjectInfo] = useState({
    id: null,
    title: "New Room Design",
    data: null
  });

  const location = useLocation();

  // Room configuration state
  const [selectedRoomType, setSelectedRoomType] = useState({
    name: "Medium Living Room",
    width: 7,
    length: 8,
    height: 6,
    type: "living",
  });
  const [roomDimensions, setRoomDimensions] = useState({
    width: 7,
    length: 8,
    height: 6,
  });

  const { isLoggedIn } = useAuth();
  const [showAuthPromptModal, setShowAuthPromptModal] = useState(false);


  // Initialize with empty arrays instead of default door/window
  const [doors, setDoors] = useState([]);
  const [windows, setWindows] = useState([]);

  const [wallColor, setWallColor] = useState("#f8f8f8");
  const [floorColor, setFloorColor] = useState("#d4b896");
  const navigate = useNavigate();
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  // Room management state
  const [roomName, setRoomName] = useState("");
  const [savedRooms, setSavedRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(uuidv4());
  const [pendingGLBLoad, setPendingGLBLoad] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Loading and initialization state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [roomInitialized, setRoomInitialized] = useState(false);
  const [projectProcessed, setProjectProcessed] = useState(false);

  // New state for project room loading
  const [hasProjectRoom, setHasProjectRoom] = useState(false);
  const [projectRoomLoaded, setProjectRoomLoaded] = useState(false);

  // Modal state
  const {
    isOpen: isSaveOpen,
    onOpen: onSaveOpen,
    onOpenChange: onSaveOpenChange,
  } = useDisclosure();
  const {
    isOpen: isLoadOpen,
    onOpen: onLoadOpen,
    onOpenChange: onLoadOpenChange,
  } = useDisclosure();

  // UI state
  const mountRef = useRef(null);

  // Scene and furniture hooks
  const {
    scene,
    renderer,
    camera,
    updateRoomDimensions,
    updateDoors,
    updateWindows,
    updateWallColor,
    updateFloorColor,
  } = useRoomScene(mountRef);

  const { roomArea, roomVolume, calculateRoomMetrics } = useRoomMeasurements();

  const {
    placedFurniture,
    selectedFurnitureItem,
    setSelectedFurnitureItem,
    addFurnitureToRoom,
    rotateFurnitureItem,
    removeFurnitureItem,
    clearAllFurniture,
    loadFurnitureFromConfig,
    areaCoveredByFurniture,
    furnitureAreaPercentage,
    gltfLoader,
    getLoadingState,
    clearModelCache,
    preloadModels,
    getModelInfo,
  } = useFurniturePlacement(scene, roomArea);

  const [furnitureLoadingState, setFurnitureLoadingState] = useState({
    isLoading: false,
    currentItem: null,
    progress: 0
  });

  // Refs to track values without causing re-renders
  const lastRoomDimensionsRef = useRef(roomDimensions);
  const lastDoorsRef = useRef(doors);
  const lastWindowsRef = useRef(windows);
  const lastWallColorRef = useRef(wallColor);
  const lastFloorColorRef = useRef(floorColor);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedIn || !projectInfo.id) {
        setShowAuthPromptModal(true);
      }
    }, 15000); // 10 seconds
    return () => clearTimeout(timer);
  }, [isLoggedIn, projectInfo.id]);



  // Initialize saved rooms on component mount
  useEffect(() => {
    const saved = getSavedRoomConfigurations();
    setSavedRooms(saved);
  }, []);

  // Process project information from location state - ONCE ONLY
  useEffect(() => {
    if (location.state?.projectId && !projectProcessed) {
      console.log("Processing project info:", location.state);

      const projectData = {
        id: location.state.projectId,
        title: location.state.projectTitle || "Project Design",
        data: location.state.projectData || null
      };

      setProjectInfo(projectData);
      setRoomName(location.state.projectTitle || "");

      // Check if a room exists for this project
      const existingRoom = getRoomConfigurationByProjectId(location.state.projectId);
      setHasProjectRoom(!!existingRoom);

      setProjectProcessed(true);
    } else if (!location.state?.projectId && !projectProcessed) {
      setProjectProcessed(true);
    }
  }, []); // Empty dependency array - run only once

  // Initialize scene without auto-loading project room
  useEffect(() => {
    if (scene && !roomInitialized && projectProcessed) {
      setRoomInitialized(true);
    }
  }, [scene, roomInitialized, projectProcessed]);

  // Function to manually load project room
  const loadProjectRoom = useCallback(async () => {
    if (!projectInfo.id) {
      alert("No project ID found!");
      return;
    }

    const existingRoom = getRoomConfigurationByProjectId(projectInfo.id);
    if (!existingRoom) {
      alert("No room configuration found for this project!");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingProgress(10);
      console.log("Loading project room:", existingRoom.name);

      // Clear existing furniture
      clearAllFurniture();
      setPendingGLBLoad(null);
      setLoadingProgress(20);

      // Set room configuration
      setCurrentRoomId(existingRoom.id);
      setRoomName(existingRoom.name);
      setLoadingProgress(30);

      setRoomDimensions(existingRoom.roomDimensions);
      setWallColor(existingRoom.wallColor);
      setFloorColor(existingRoom.floorColor);
      setLoadingProgress(40);

      if (existingRoom.doors) {
        setDoors(existingRoom.doors);
      }
      if (existingRoom.windows) {
        setWindows(existingRoom.windows);
      }
      setLoadingProgress(50);

      // Separate GLB and regular furniture
      const hasGLBModels = existingRoom.placedFurniture?.some(item => item.isGLB) || false;
      const regularFurniture = existingRoom.placedFurniture?.filter(item => !item.isGLB) || [];
      setLoadingProgress(60);

      // Load regular furniture immediately
      if (regularFurniture.length > 0) {
        console.log("Loading regular furniture immediately...");
        await loadFurnitureFromConfig(regularFurniture);
        setLoadingProgress(80);
      }

      // Set pending GLB models for later loading
      if (hasGLBModels) {
        const glbModels = existingRoom.placedFurniture.filter(item => item.isGLB);
        setPendingGLBLoad(glbModels);
        console.log(`Project room loaded successfully! ${glbModels.length} GLB models pending.`);
      }

      setLoadingProgress(100);
      setProjectRoomLoaded(true);

      // Small delay to show completion
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        alert("Project room loaded successfully!");
      }, 500);

    } catch (error) {
      console.error("Error loading project room:", error);
      setIsLoading(false);
      setLoadingProgress(0);
      alert("Error occurred while loading project room.");
    }
  }, [projectInfo.id, clearAllFurniture, loadFurnitureFromConfig]);

  // Create room configuration object - STABLE FUNCTION
  const createRoomConfig = useCallback(() => {
    return {
      id: currentRoomId,
      name: roomName || projectInfo.title || `Room Design ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "2.0",
      projectId: projectInfo.id,
      projectTitle: projectInfo.title,
      roomDimensions,
      doors: doors.map((door) => ({
        id: door.id,
        wall: door.wall,
        position: door.position,
        width: door.width,
        height: door.height,
      })),
      windows: windows.map((window) => ({
        id: window.id,
        wall: window.wall,
        position: window.position,
        width: window.width,
        height: window.height,
        sillHeight: window.sillHeight,
      })),
      wallColor,
      floorColor,
      wallTexture: "smooth",
      placedFurniture: placedFurniture.filter(item => item && item.id).map((item) => ({
        id: item.id,
        furnitureId: item.id,
        name: item.name,
        type: item.type,
        category: item.category,
        position: item.position
          ? { x: item.position.x, y: item.position.y, z: item.position.z }
          : { x: 0, y: 0, z: 0 },
        rotation: item.rotation
          ? { x: item.rotation.x, y: item.rotation.y, z: item.rotation.z }
          : { x: 0, y: 0, z: 0 },
        dimensions: item.dimensions,
        color: item.color,
        material: item.material,
        style: item.style,
        price: item.price,
        isGLB: true,
        modelPath: item.modelPath,
        imagePath: item.imagePath,
        appliedScale: item.appliedScale,
        glbData: item.object ? serializeGLBData(item.object, item) : null
      })),
      placedCarpets: [],
      totalCost: calculateTotalCost(
        placedFurniture.filter(item => item && item.id).map((item) => ({ furnitureId: item.id }))
      ),
      roomArea,
      furnitureAreaPercentage,
    };
  }, [
    currentRoomId,
    roomName,
    projectInfo.id,
    projectInfo.title,
    roomDimensions,
    doors,
    windows,
    wallColor,
    floorColor,
    placedFurniture,
    roomArea,
    furnitureAreaPercentage
  ]);

  // Load room configuration for non-project rooms
  const loadRoom = useCallback(async (config) => {
    if (isLoading) {
      console.log("Room loading already in progress, skipping...");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingProgress(10);
      console.log("Loading room configuration:", config.name);

      // Clear existing furniture
      clearAllFurniture();
      setPendingGLBLoad(null);
      setLoadingProgress(20);

      // Set room configuration
      setCurrentRoomId(config.id);
      setRoomName(config.name);
      setLoadingProgress(30);

      setRoomDimensions(config.roomDimensions);
      setWallColor(config.wallColor);
      setFloorColor(config.floorColor);
      setLoadingProgress(40);

      if (config.doors) {
        setDoors(config.doors);
      }
      if (config.windows) {
        setWindows(config.windows);
      }
      setLoadingProgress(50);

      // Separate GLB and regular furniture
      const hasGLBModels = config.placedFurniture?.some(item => item.isGLB) || false;
      const regularFurniture = config.placedFurniture?.filter(item => !item.isGLB) || [];
      setLoadingProgress(60);

      // Load regular furniture immediately
      if (regularFurniture.length > 0) {
        console.log("Loading regular furniture immediately...");
        await loadFurnitureFromConfig(regularFurniture);
        setLoadingProgress(80);
      }

      // Set pending GLB models for later loading
      if (hasGLBModels) {
        const glbModels = config.placedFurniture.filter(item => item.isGLB);
        setPendingGLBLoad(glbModels);
        console.log(`Room loaded successfully! ${glbModels.length} GLB models pending.`);
      }

      setLoadingProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        if (onLoadOpenChange) {
          onLoadOpenChange(false);
        }
      }, 500);

    } catch (error) {
      console.error("Error loading room:", error);
      setIsLoading(false);
      setLoadingProgress(0);
      alert("Error occurred while loading room.");
    }
  }, [clearAllFurniture, loadFurnitureFromConfig, onLoadOpenChange, isLoading]);

  // Load pending GLB models
  const loadPendingGLBModels = async () => {
    if (!pendingGLBLoad || pendingGLBLoad.length === 0) return;

    try {
      console.log("Loading pending GLB models...");
      setIsLoading(true);
      setLoadingProgress(0);

      const result = await loadFurnitureFromConfig(pendingGLBLoad);

      if (result.errors && result.errors.length > 0) {
        console.warn("Some GLB models failed to load:", result.errors);
        alert(`3D Models loaded with ${result.errors.length} warnings. Check console for details.`);
      } else {
        alert("3D Models loaded successfully!");
      }

      setPendingGLBLoad(null);
    } catch (error) {
      console.error("Error loading GLB models:", error);
      alert("Error occurred while loading 3D models.");
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  // Save room manually
  const saveCurrentRoom = async () => {
    if (!isLoggedIn || !projectInfo.id) {
      alert("Please login first and start a design.");
      return;
    }
    const config = createRoomConfig();

    try {
      const success = saveRoomConfigurationWithGLB(config);

      if (success) {
        try {
          await sendRoomToBackend(config);
          alert("Room saved successfully!");
        } catch (backendError) {
          console.warn("Failed to send to backend:", backendError);
          alert("Room saved locally successfully!");
        }

        setSavedRooms(getSavedRoomConfigurations());
        onSaveOpenChange(false);

        // Update project room status
        if (projectInfo.id) {
          setHasProjectRoom(true);
          setProjectRoomLoaded(true);
        }
      } else {
        alert("Failed to save room configuration.");
      }
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Error occurred while saving room.");
    }
  };



  // Delete saved room
  const deleteSavedRoom = (id) => {
    deleteRoomConfiguration(id);
    setSavedRooms(getSavedRoomConfigurations());
  };

  // Door management functions
  const handleAddDoor = () => {
    const newDoor = {
      id: `door${doors.length + 1}`,
      wall: "east",
      position: Math.min(2, roomDimensions.width / 2),
      width: 0.9,
      height: 2.1,
    };
    setDoors([...doors, newDoor]);
  };

  const handleUpdateDoor = (id, updates) => {
    setDoors(
      doors.map((door) => (door.id === id ? { ...door, ...updates } : door))
    );
  };

  const handleRemoveDoor = (id) => {
    setDoors(doors.filter((door) => door.id !== id));
  };

  // Window management functions
  const handleAddWindow = () => {
    const newWindow = {
      id: `window${windows.length + 1}`,
      wall: "west",
      position: Math.min(2, roomDimensions.length / 2),
      width: 1.2,
      height: 1.2,
      sillHeight: 0.9,
    };
    setWindows([...windows, newWindow]);
  };

  const handleUpdateWindow = (id, updates) => {
    setWindows(
      windows.map((window) =>
        window.id === id ? { ...window, ...updates } : window
      )
    );
  };

  const handleAddFurnitureError = useCallback((error) => {
    console.error("Error adding 3D furniture:", error);

    let errorMessage = "Failed to load 3D model";
    if (error.message.includes("timeout")) {
      errorMessage = "3D model loading timed out. Please try again.";
    } else if (error.message.includes("network")) {
      errorMessage = "Network error loading 3D model. Check your connection.";
    } else if (error.message.includes("GLB")) {
      errorMessage = "Invalid 3D model file. Please contact support.";
    }

    alert(errorMessage);
  }, []);

  // Enhanced furniture addition with better error handling
  const handleAddFurnitureToRoom = useCallback(async (furnitureItem) => {
    try {
      console.log("Adding furniture to room:", furnitureItem.name);
      console.log("Current scene state:", !!scene);
      console.log("Current placedFurniture count:", placedFurniture?.length || 0);

      const result = await addFurnitureToRoom(furnitureItem);

      console.log("Add furniture result:", result);

      if (result && result.success !== false) {
        console.log("Furniture added successfully");
      } else {
        console.error("Failed to add furniture:", result);
        handleAddFurnitureError(new Error("Failed to add furniture to scene"));
      }

      return result;
    } catch (error) {
      console.error("Error in handleAddFurnitureToRoom:", error);
      handleAddFurnitureError(error);
      throw error;
    }
  }, [addFurnitureToRoom, scene, placedFurniture, handleAddFurnitureError]);

  const handleRemoveWindow = (id) => {
    setWindows(windows.filter((window) => window.id !== id));
  };

  // Update the loading state tracking effect
  useEffect(() => {
    const updateLoadingState = () => {
      const state = getLoadingState();
      setFurnitureLoadingState(state);
    };

    // Update loading state every 500ms when loading
    let interval;
    if (getLoadingState().isLoading) {
      interval = setInterval(updateLoadingState, 500);
    } else {
      updateLoadingState();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [getLoadingState]);

  // Update room dimensions when scene is ready - CONTROLLED UPDATES
  useEffect(() => {
    if (!updateRoomDimensions || !roomInitialized || isLoading) return;

    const currentDims = roomDimensions;
    const lastDims = lastRoomDimensionsRef.current;

    // Only update if dimensions actually changed
    if (
      currentDims.width !== lastDims.width ||
      currentDims.length !== lastDims.length ||
      currentDims.height !== lastDims.height
    ) {
      lastRoomDimensionsRef.current = currentDims;

      const updateRoom = async () => {
        try {
          await updateRoomDimensions(currentDims, (progress) => {
            if (progress === 1) {
              calculateRoomMetrics(currentDims);
            }
          });
        } catch (error) {
          console.error("Error updating room dimensions:", error);
        }
      };
      updateRoom();
    }
  }, [roomDimensions.width, roomDimensions.length, roomDimensions.height, updateRoomDimensions, calculateRoomMetrics, roomInitialized, isLoading]);

  // Update doors - CONTROLLED UPDATES
  useEffect(() => {
    if (!updateDoors || !roomInitialized) return;

    const currentDoors = doors;
    const lastDoors = lastDoorsRef.current;

    // Only update if doors actually changed
    if (JSON.stringify(currentDoors) !== JSON.stringify(lastDoors)) {
      lastDoorsRef.current = currentDoors;
      updateDoors(currentDoors);
    }
  }, [doors, updateDoors, roomInitialized]);

  // Update windows - CONTROLLED UPDATES
  useEffect(() => {
    if (!updateWindows || !roomInitialized) return;

    const currentWindows = windows;
    const lastWindows = lastWindowsRef.current;

    // Only update if windows actually changed
    if (JSON.stringify(currentWindows) !== JSON.stringify(lastWindows)) {
      lastWindowsRef.current = currentWindows;
      updateWindows(currentWindows);
    }
  }, [windows, updateWindows, roomInitialized]);

  // Update colors - CONTROLLED UPDATES
  useEffect(() => {
    if (!updateWallColor || !roomInitialized) return;

    if (wallColor !== lastWallColorRef.current) {
      lastWallColorRef.current = wallColor;
      updateWallColor(wallColor);
    }
  }, [wallColor, updateWallColor, roomInitialized]);

  useEffect(() => {
    if (!updateFloorColor || !roomInitialized) return;

    if (floorColor !== lastFloorColorRef.current) {
      lastFloorColorRef.current = floorColor;
      updateFloorColor(floorColor);
    }
  }, [floorColor, updateFloorColor, roomInitialized]);

  // Update room type - CONTROLLED UPDATES
  useEffect(() => {
    if (!selectedRoomType || !roomInitialized || isLoading) return;

    const newDimensions = {
      width: selectedRoomType.width,
      length: selectedRoomType.length,
      height: selectedRoomType.height,
    };

    const currentDims = roomDimensions;

    // Only update if dimensions actually changed
    if (
      newDimensions.width !== currentDims.width ||
      newDimensions.length !== currentDims.length ||
      newDimensions.height !== currentDims.height
    ) {
      setRoomDimensions(newDimensions);
    }
  }, [selectedRoomType.name, roomInitialized, isLoading]);

  // Auto-save functionality - MINIMAL DEPENDENCIES
  const performAutoSave = useCallback(() => {
    if (!autoSaveEnabled || !projectInfo.id || !roomInitialized) {
      return;
    }

    // Only auto-save if project room is loaded or if there's meaningful content
    if (!projectRoomLoaded && placedFurniture.length === 0) {
      return;
    }

    // Check if there's any meaningful content to save
    const hasContent = placedFurniture.length > 0 ||
      roomDimensions.width !== 7 ||
      roomDimensions.length !== 8 ||
      roomDimensions.height !== 5 ||
      doors.length > 0 ||  // Changed from > 1 to > 0
      windows.length > 0 ||  // Changed from > 1 to > 0
      wallColor !== "#f8f8f8" ||
      floorColor !== "#d4b896";

    if (!hasContent && !projectRoomLoaded) {
      return;
    }

    console.log("Auto-saving room for project:", projectInfo.id, projectInfo.title);

    const config = createRoomConfig();

    try {
      const success = saveRoomConfigurationWithGLB(config);
      if (success) {
        console.log("Auto-saved room successfully for project:", projectInfo.title);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  }, [
    autoSaveEnabled,
    projectInfo.id,
    projectInfo.title,
    roomInitialized,
    projectRoomLoaded,
    placedFurniture.length,
    roomDimensions,
    doors.length,
    windows.length,
    wallColor,
    floorColor,
    createRoomConfig
  ]);

  // Auto-save timer - STABLE DEPENDENCIES
  useEffect(() => {
    if (!autoSaveEnabled || !projectInfo.id || !roomInitialized) return;

    const autoSaveTimer = setTimeout(() => {
      performAutoSave();
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [
    roomDimensions.width,
    roomDimensions.length,
    roomDimensions.height,
    doors.length,
    windows.length,
    wallColor,
    floorColor,
    placedFurniture.length,
    projectInfo.id,
    roomInitialized,
    autoSaveEnabled,
    projectRoomLoaded,
    performAutoSave
  ]);

  useEffect(() => {
    return () => {
      // Clear model cache when component unmounts
      if (clearModelCache) {
        clearModelCache();
      }
    };
  }, [clearModelCache]);

  const totalCost = calculateTotalCost(
    placedFurniture?.filter(item => item && item.id)?.map((item) => ({ furnitureId: item.id })) || []
  );

  return (
    <div className="room-designer-container">
      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-screen-content">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <h2>
              {furnitureLoadingState.isLoading ? "Loading 3D Model..." : "Loading Room..."}
            </h2>
            <p>
              {furnitureLoadingState.isLoading
                ? `Loading: ${furnitureLoadingState.currentItem || "3D Model"}`
                : projectInfo.title
                  ? `Loading "${projectInfo.title}" project room`
                  : "Please wait while we prepare your room"
              }
            </p>
            <div className="loading-progress-container">
              <div className="loading-progress-bar-container">
                <div
                  className="loading-progress-bar"
                  style={{
                    width: `${furnitureLoadingState.isLoading
                      ? furnitureLoadingState.progress
                      : loadingProgress}%`
                  }}
                ></div>
              </div>
              <p className="loading-percentage">
                {Math.round(furnitureLoadingState.isLoading
                  ? furnitureLoadingState.progress
                  : loadingProgress)}% complete
              </p>
              {furnitureLoadingState.totalItems > 0 && (
                <p className="loading-items-info">
                  {furnitureLoadingState.completedItems}/{furnitureLoadingState.totalItems} models processed
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Header />

      {/* Project Section */}
      <div className="project-section">
        <div className="project-header">
          <div className="project-info">
            <h1>
              {projectInfo.id ? `Project: ${projectInfo.title}` : "Room Designer"}
            </h1>
            <p>
              {projectInfo.id && (
                <span className="project-status-text">
                  {hasProjectRoom && (
                    <span className={projectRoomLoaded ? "status-loaded" : "status-available"}>
                      {projectRoomLoaded ? "Room loaded" : "Room available"}
                    </span>
                  )}
                  {!hasProjectRoom && (
                    <span className="status-none">No room design yet</span>
                  )}
                </span>
              )}
            </p>
          </div>
          <div className="project-buttons">
            {/* Project Room Load Button */}
            {projectInfo.id && hasProjectRoom && !projectRoomLoaded && (
              <button
                className="btn btn-load-project"
                onClick={loadProjectRoom}
              >
                <FolderOpen className="btn-icon" />
                <span>Load Project Room</span>
              </button>
            )}

            <button
              className="btn btn-save"
              onClick={() => {
                if (!isLoggedIn || !projectInfo.id) {
                  setShowAuthPromptModal(true);
                } else {
                  onSaveOpen();
                }
              }}
            >
              <Save className="btn-icon" />
              <span>Save</span>
            </button>




            {pendingGLBLoad && pendingGLBLoad.length > 0 && (
              <button
                className="btn btn-load-models"
                onClick={loadPendingGLBModels}
              >
                <Package className="btn-icon" />
                Load 3D Models ({pendingGLBLoad.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Sidebar */}
        <Sidebar
          // Room Settings Props
          selectedRoomType={selectedRoomType}
          setSelectedRoomType={setSelectedRoomType}
          roomDimensions={roomDimensions}
          setRoomDimensions={setRoomDimensions}
          wallColor={wallColor}
          setWallColor={setWallColor}
          floorColor={floorColor}
          setFloorColor={setFloorColor}
          doors={doors}
          windows={windows}
          handleAddDoor={handleAddDoor}
          handleUpdateDoor={handleUpdateDoor}
          handleRemoveDoor={handleRemoveDoor}
          handleAddWindow={handleAddWindow}
          handleUpdateWindow={handleUpdateWindow}
          handleRemoveWindow={handleRemoveWindow}

          // Measurements Props
          roomArea={roomArea}
          roomVolume={roomVolume}
          furnitureAreaPercentage={furnitureAreaPercentage}
          totalCost={totalCost}

          // Furniture Props
          selectedFurnitureItem={selectedFurnitureItem}
          setSelectedFurnitureItem={setSelectedFurnitureItem}
          addFurnitureToRoom={handleAddFurnitureToRoom}
          placedFurniture={placedFurniture}
          rotateFurnitureItem={rotateFurnitureItem}
          removeFurnitureItem={removeFurnitureItem}
          clearAllFurniture={clearAllFurniture}
          furnitureLoadingState={furnitureLoadingState}

          // Loading Props
          isLoading={isLoading}
          loadingProgress={loadingProgress}
        />

        {/* 3D View */}
        <div className="three-d-view-container">
          <h2 className="three-d-view-header">
            {selectedRoomType.name} - 3D Preview
            {projectInfo.id && (
              <span className="project-title-small">
                ({projectInfo.title})
              </span>
            )}
          </h2>

          <div
            ref={mountRef}
            className="three-d-viewport"
          >
            {isLoading && (
              <div className="viewport-loading-overlay">
                <div className="viewport-loading-text">
                  Loading Room...
                </div>
                <div className="viewport-progress-bar">
                  <div
                    className="viewport-progress-fill"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <div className="viewport-progress-text">
                  {Math.round(loadingProgress)}%
                </div>
              </div>
            )}
          </div>


        </div>
      </div>


      {/* Save Modal */}
      {isSaveOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            color: "black",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>Save Room Design</h2>

            <input
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
              placeholder="Enter a name for your room design"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <div style={{ marginBottom: "20px" }}>
              <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
                This will save your room configuration including:
              </p>
              <ul style={{ paddingLeft: "20px", marginBottom: "10px" }}>
                <li>Room dimensions and colors</li>
                <li>Doors ({doors.length}) and windows ({windows.length})</li>
                <li>Furniture placement ({placedFurniture.length} items)</li>
                <li>Total cost: ${totalCost}</li>
                {projectInfo.id && (
                  <li style={{ color: "green", fontWeight: "bold" }}>
                    ✓ Linked to project: {projectInfo.title}
                  </li>
                )}
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => onSaveOpenChange(false)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#ccc",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentRoom}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Save Room
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Load Modal */}
      <Modal isOpen={isLoadOpen} onOpenChange={onLoadOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="modal-header">
                Load Saved Room
              </ModalHeader>
              <ModalBody className="modal-body">
                {savedRooms.length === 0 ? (
                  <div className="empty-state">
                    <FileText className="empty-state-icon" />
                    <p className="empty-state-text">No saved rooms found</p>
                  </div>
                ) : (
                  <div className="saved-rooms-container">
                    <div className="saved-rooms-list">
                      {savedRooms
                        .filter(room => !projectInfo.id || room.projectId !== projectInfo.id)
                        .map((room) => (
                          <div
                            key={room.id}
                            className="saved-room-item"
                          >
                            <div className="saved-room-info">
                              <h4 className="saved-room-title">{room.name}</h4>
                              <p className="saved-room-details">
                                {room.roomDimensions.width}×
                                {room.roomDimensions.length}m •
                                {room.placedFurniture?.length || 0} items •
                                {room.doors?.length || 0} doors •
                                {room.windows?.length || 0} windows • $
                                {room.totalCost || 0}
                                {room.version === "2.0" && (
                                  <span className="glb-support">
                                    • GLB Support
                                  </span>
                                )}
                                {room.projectId && (
                                  <span className="project-info-small">
                                    • Project: {room.projectTitle}
                                  </span>
                                )}
                              </p>
                              <p className="saved-room-meta">
                                Created:{" "}
                                {new Date(room.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="saved-room-actions">
                              <button
                                className="btn-small btn-load"
                                onClick={() => {
                                  loadRoom(room);
                                }}
                              >
                                Load
                              </button>
                              <button
                                className="btn-small btn-delete"
                                onClick={() => deleteSavedRoom(room.id)}
                              >
                                <Trash2 className="delete-icon" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {projectInfo.id && (
                  <div className="note-section">
                    <p className="note-text">
                      <strong>Note:</strong> This will load a different room design.
                      Your current project room will not be affected.
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="modal-footer">
                <button className="btn btn-close" onClick={onClose}>
                  Close
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {showAuthPromptModal && (
        <AuthPromptModal
          variant={!isLoggedIn ? "notLoggedIn" : "noProject"}
          onClose={() => setShowAuthPromptModal(false)}
          onLoginStartProject={() => {
            setShowAuthPopup(true);
            setShowAuthPromptModal(false);
          }}
          onPickDesignerStart={() => {
            navigate("/search");
          }}
        />
      )}

      {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}


      <Footer />


    </div>
  );
};

export default CustomRoomDesigner;