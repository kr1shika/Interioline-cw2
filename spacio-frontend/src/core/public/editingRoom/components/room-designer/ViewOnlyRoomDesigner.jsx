import {
    ArrowLeft,
    Eye,
    FolderOpen,
    Package,
    Star
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddReviewModal from "../../../../../components/AddReviewModal.jsx";
import Header from "../../../../../components/header.jsx";
import Toast from "../../../../../components/toastMessage.jsx";
import "./ViewOnlyRoomDesigner.css";
import ViewOnlySidebar from "./ViewOnlySidebar.jsx";

import { useFurniturePlacement } from "../hooks/useFurniturePlacement";
import { useRoomMeasurements } from "../hooks/useRoomMeasurements";
import { useRoomScene } from "../hooks/useRoomScene";
import {
    calculateTotalCost,
    getRoomConfigurationByProjectId
} from "./furniture-Catalog";

const ViewOnlyRoomDesigner = () => {
    // Project state management
    const [projectInfo, setProjectInfo] = useState({
        id: null,
        title: "Room View",
        status: null,
        data: null
    });

    const location = useLocation();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);

    // Review modal state
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // Room configuration state
    const [roomDimensions, setRoomDimensions] = useState({
        width: 7,
        length: 8,
        height: 6,
    });

    const [doors, setDoors] = useState([
        { id: "door1", wall: "south", position: 2, width: 0.9, height: 2.1 },
    ]);
    const [windows, setWindows] = useState([
        {
            id: "window1",
            wall: "north",
            position: 2.5,
            width: 1.5,
            height: 1.2,
            sillHeight: 0.9,
        },
    ]);

    const [wallColor, setWallColor] = useState("#f8f8f8");
    const [floorColor, setFloorColor] = useState("#d4b896");
    const [roomName, setRoomName] = useState("");

    // Loading and initialization state
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [roomInitialized, setRoomInitialized] = useState(false);
    const [projectProcessed, setProjectProcessed] = useState(false);
    const [projectRoomLoaded, setProjectRoomLoaded] = useState(false);
    const [pendingGLBLoad, setPendingGLBLoad] = useState(null);
    const [hasProjectRoom, setHasProjectRoom] = useState(false);

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
        loadFurnitureFromConfig,
        areaCoveredByFurniture,
        furnitureAreaPercentage,
        getLoadingState,
        clearModelCache,
        clearAllFurniture,
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

    // Show toast message
    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    };

    // Get status display class
    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'status-pending';
            case 'in_progress':
                return 'status-in-progress';
            case 'completed':
                return 'status-completed';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    };

    // Format status for display
    const formatStatus = (status) => {
        if (!status) return 'Unknown';
        return status.replace('_', ' ');
    };

    // Handle add review
    const handleAddReview = () => {
        setIsReviewModalOpen(true);
    };

    // Handle review modal close
    const handleReviewModalClose = () => {
        setIsReviewModalOpen(false);
    };

    // Handle successful review submission
    const handleReviewSubmitSuccess = (review) => {
        showToast("Review submitted successfully! Thank you for your feedback.", "success");
        console.log("Review submitted:", review);
    };

    // Process project information from location state - ONCE ONLY
    useEffect(() => {
        if (location.state?.projectId && !projectProcessed) {
            console.log("Processing project info for view-only mode:", location.state);

            const projectData = {
                id: location.state.projectId,
                title: location.state.projectTitle || "Project View",
                status: location.state.projectStatus || location.state.projectData?.status || null,
                data: location.state.projectData || null
            };

            console.log("Project data processed:", projectData);

            setProjectInfo(projectData);
            setRoomName(location.state.projectTitle || "");

            // Check if a room exists for this project
            const existingRoom = getRoomConfigurationByProjectId(location.state.projectId);
            setHasProjectRoom(!!existingRoom);

            if (!existingRoom) {
                showToast("Room design is not available yet. Please wait for the designer to create it.", "warning");
                setTimeout(() => {
                    navigate(-1);
                }, 3000);
                return;
            }

            setProjectProcessed(true);
        } else if (!location.state?.projectId && !projectProcessed) {
            showToast("No project information found.", "error");
            setTimeout(() => {
                navigate(-1);
            }, 2000);
            setProjectProcessed(true);
        }
    }, []);

    useEffect(() => {
        if (scene && !roomInitialized && projectProcessed) {
            setRoomInitialized(true);
        }
    }, [scene, roomInitialized, projectProcessed]);

    // Function to manually load project room
    const loadProjectRoom = useCallback(async () => {
        if (!projectInfo.id) {
            showToast("No project ID found!", "error");
            setTimeout(() => navigate(-1), 2000);
            return;
        }

        const existingRoom = getRoomConfigurationByProjectId(projectInfo.id);
        if (!existingRoom) {
            showToast("No room configuration found for this project!", "warning");
            setTimeout(() => navigate(-1), 2000);
            return;
        }

        try {
            setIsLoading(true);
            setLoadingProgress(10);
            console.log("Loading project room for viewing:", existingRoom.name);

            clearAllFurniture();
            setPendingGLBLoad(null);
            setLoadingProgress(20);

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

            const hasGLBModels = existingRoom.placedFurniture?.some(item => item.isGLB) || false;
            const regularFurniture = existingRoom.placedFurniture?.filter(item => !item.isGLB) || [];
            setLoadingProgress(60);

            if (regularFurniture.length > 0) {
                console.log("Loading regular furniture...");
                await loadFurnitureFromConfig(regularFurniture);
                setLoadingProgress(80);
            }

            if (hasGLBModels) {
                const glbModels = existingRoom.placedFurniture.filter(item => item.isGLB);
                setPendingGLBLoad(glbModels);
                console.log(`Room loaded! ${glbModels.length} GLB models pending.`);
            }

            setLoadingProgress(100);
            setProjectRoomLoaded(true);

            setTimeout(() => {
                setIsLoading(false);
                setLoadingProgress(0);
                showToast("Room loaded successfully!", "success");
            }, 500);

        } catch (error) {
            console.error("Error loading project room:", error);
            setIsLoading(false);
            setLoadingProgress(0);
            showToast("Error occurred while loading room.", "error");
        }
    }, [projectInfo.id, loadFurnitureFromConfig, clearAllFurniture]);

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
                showToast(`3D Models loaded with ${result.errors.length} warnings.`, "warning");
            } else {
                showToast("3D Models loaded successfully!", "success");
            }

            setPendingGLBLoad(null);
        } catch (error) {
            console.error("Error loading GLB models:", error);
            showToast("Error occurred while loading 3D models.", "error");
        } finally {
            setIsLoading(false);
            setLoadingProgress(0);
        }
    };

    // Update room dimensions when scene is ready
    useEffect(() => {
        if (!updateRoomDimensions || !roomInitialized || isLoading) return;

        const currentDims = roomDimensions;
        const lastDims = lastRoomDimensionsRef.current;

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

    // Update doors
    useEffect(() => {
        if (!updateDoors || !roomInitialized) return;

        const currentDoors = doors;
        const lastDoors = lastDoorsRef.current;

        if (JSON.stringify(currentDoors) !== JSON.stringify(lastDoors)) {
            lastDoorsRef.current = currentDoors;
            updateDoors(currentDoors);
        }
    }, [doors, updateDoors, roomInitialized]);

    // Update windows
    useEffect(() => {
        if (!updateWindows || !roomInitialized) return;

        const currentWindows = windows;
        const lastWindows = lastWindowsRef.current;

        if (JSON.stringify(currentWindows) !== JSON.stringify(lastWindows)) {
            lastWindowsRef.current = currentWindows;
            updateWindows(currentWindows);
        }
    }, [windows, updateWindows, roomInitialized]);

    // Update colors
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

    // Update the loading state tracking effect
    useEffect(() => {
        const updateLoadingState = () => {
            const state = getLoadingState();
            setFurnitureLoadingState(state);
        };

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

    useEffect(() => {
        return () => {
            if (clearModelCache) {
                clearModelCache();
            }
        };
    }, [clearModelCache]);

    const totalCost = calculateTotalCost(
        placedFurniture?.filter(item => item && item.id)?.map((item) => ({ furnitureId: item.id })) || []
    );

    return (
        <div className="view-only-container">
            {/* Toast Message */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                />
            )}

            {/* Review Modal */}
            <AddReviewModal
                isOpen={isReviewModalOpen}
                onClose={handleReviewModalClose}
                projectInfo={projectInfo}
                onSubmitSuccess={handleReviewSubmitSuccess}
            />

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
                                    ? `Loading "${projectInfo.title}" room design`
                                    : "Please wait while we prepare your room"
                            }
                        </p>
                        <div className="loading-progress-large">
                            <div className="loading-progress">
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
            <div className="header-section">
                <div className="header-content">
                    <div className="header-info">
                        <h1>
                            <Eye className="eye-icon" />
                            Viewing: {projectInfo.title}
                        </h1>
                        <p>
                            <span className="view-mode-badge">View-Only Mode</span>
                            {projectInfo.status && (
                                <span className={`project-status ${getStatusClass(projectInfo.status)}`}>
                                    {formatStatus(projectInfo.status)}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="header-buttons">
                        {/* Project Room Load Button */}
                        {projectInfo.id && hasProjectRoom && !projectRoomLoaded && (
                            <button
                                className="btn btn-primary"
                                onClick={loadProjectRoom}
                            >
                                <FolderOpen className="btn-icon" />
                                Load Project Room
                            </button>
                        )}

                        {/* Add Review Button - only show if project is completed */}
                        {projectInfo.status === 'completed' && (
                            <button
                                className="btn btn-success"
                                onClick={handleAddReview}
                            >
                                <Star className="btn-icon" />
                                Add Review
                            </button>
                        )}

                        {/* Back button */}
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="btn-icon" />
                            Back to Projects
                        </button>

                        {/* Load 3D Models button */}
                        {pendingGLBLoad && pendingGLBLoad.length > 0 && (
                            <button
                                className="btn btn-warning"
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
                {/* View-Only Sidebar */}
                <ViewOnlySidebar
                    placedFurniture={placedFurniture}
                    wallColor={wallColor}
                    floorColor={floorColor}
                    roomArea={roomArea}
                    roomVolume={roomVolume}
                    furnitureAreaPercentage={furnitureAreaPercentage}
                    totalCost={totalCost}
                    doors={doors}
                    windows={windows}
                    roomDimensions={roomDimensions}
                    furnitureLoadingState={furnitureLoadingState}
                    projectRoomLoaded={projectRoomLoaded}
                />

                {/* 3D View */}
                <div className="room-view-container">
                    <h2 className="room-view-header">
                        3D Room View - {roomName || projectInfo.title}
                        <span className="view-only-indicator">
                            • View Only
                        </span>
                    </h2>

                    <div
                        ref={mountRef}
                        className="three-d-container"
                    >
                        {isLoading && (
                            <div className="loading-overlay">
                                <div className="loading-text">
                                    Loading Room...
                                </div>
                                <div className="loading-progress">
                                    <div
                                        className="loading-progress-bar"
                                        style={{ width: `${loadingProgress}%` }}
                                    ></div>
                                </div>
                                <div className="loading-percentage">
                                    {Math.round(loadingProgress)}%
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="room-status">
                        <div className="room-status-text">
                            <p>
                                <strong>Room Status:</strong>
                                <span className="status-doors">
                                    {" "}Doors: {doors.length}
                                </span>{" "}
                                |
                                <span className="status-windows">
                                    {" "}Windows: {windows.length}
                                </span>{" "}
                                |
                                <span className="status-models">
                                    {" "}3D Models: {placedFurniture.length} items
                                </span>
                                {furnitureLoadingState.isLoading && (
                                    <>
                                        {" "}|
                                        <span className="status-loading">
                                            {" "}Loading: {furnitureLoadingState.currentItem || "Processing..."}
                                        </span>
                                    </>
                                )}
                                <span className="status-view-mode">
                                    {" "}| View-Only Mode
                                </span>
                            </p>
                            <p className="room-tip">
                                💡 You are viewing this room design in read-only mode. Contact your designer for modifications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOnlyRoomDesigner;