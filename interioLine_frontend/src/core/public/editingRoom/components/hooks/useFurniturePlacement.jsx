import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { v4 as uuidv4 } from "uuid";

export const useFurniturePlacement = (scene, roomArea) => {
    const [placedFurniture, setPlacedFurniture] = useState([]);
    const [selectedFurnitureItem, setSelectedFurnitureItem] = useState(null);
    const [areaCoveredByFurniture, setAreaCoveredByFurniture] = useState(0);
    const [furnitureAreaPercentage, setFurnitureAreaPercentage] = useState(0);

    const dragControlsRef = useRef(null);
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseRef = useRef(new THREE.Vector2());
    const isDraggingRef = useRef(false);
    const selectedObjectRef = useRef(null);
    const offsetRef = useRef(new THREE.Vector3());
    const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
    const gltfLoaderRef = useRef(new GLTFLoader());
    const modelCacheRef = useRef(new Map());

    // Enhanced loading state management
    const loadingStateRef = useRef({
        isLoading: false,
        currentItem: null,
        progress: 0,
        loadedItems: new Set(),
        failedItems: new Set(),
        totalItems: 0,
        completedItems: 0
    });

    // Calculate furniture area coverage
    useEffect(() => {
        const totalArea = placedFurniture.reduce((total, item) => {
            if (item && item.dimensions) {
                return total + item.dimensions.width * item.dimensions.depth;
            }
            return total;
        }, 0);

        setAreaCoveredByFurniture(totalArea);

        if (roomArea > 0) {
            const percentage = (totalArea / roomArea) * 100;
            setFurnitureAreaPercentage(percentage);
        }
    }, [placedFurniture, roomArea]);

    // Setup drag controls when scene and furniture are ready
    useEffect(() => {
        if (!scene || placedFurniture.length === 0) {
            cleanupDragControls();
            return;
        }

        setupDragControls();

        return () => {
            cleanupDragControls();
        };
    }, [scene, placedFurniture]);

    const setupDragControls = () => {
        if (!scene || !scene.renderer || !scene.camera) return;

        const canvas = scene.renderer.domElement;
        if (!canvas) return;

        cleanupDragControls();

        canvas.addEventListener("mousedown", onMouseDown, false);
        canvas.addEventListener("mousemove", onMouseMove, false);
        canvas.addEventListener("mouseup", onMouseUp, false);
        canvas.addEventListener("contextmenu", onContextMenu, false);

        console.log("Drag controls setup completed for", placedFurniture.length, "3D furniture items");
    };

    const cleanupDragControls = () => {
        if (!scene || !scene.renderer) return;

        const canvas = scene.renderer.domElement;
        if (canvas) {
            canvas.removeEventListener("mousedown", onMouseDown, false);
            canvas.removeEventListener("mousemove", onMouseMove, false);
            canvas.removeEventListener("mouseup", onMouseUp, false);
            canvas.removeEventListener("contextmenu", onContextMenu, false);
        }
    };

    const onContextMenu = (event) => {
        event.preventDefault();
    };

    const onMouseDown = (event) => {
        if (!scene || !scene.camera || !scene.renderer) return;
        if (event.button !== 0) return;

        const canvas = scene.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, scene.camera);

        const furnitureObjects = placedFurniture
            .map((item) => item.object)
            .filter((obj) => obj && obj.visible);

        if (furnitureObjects.length === 0) return;

        const intersects = raycasterRef.current.intersectObjects(furnitureObjects, true);

        if (intersects.length > 0) {
            let furnitureObject = intersects[0].object;
            while (furnitureObject.parent && !furnitureObjects.includes(furnitureObject)) {
                furnitureObject = furnitureObject.parent;
            }

            if (furnitureObjects.includes(furnitureObject)) {
                selectedObjectRef.current = furnitureObject;
                isDraggingRef.current = true;

                if (scene.orbitControls) {
                    scene.orbitControls.enabled = false;
                }

                const intersectionPoint = intersects[0].point;
                offsetRef.current.copy(intersectionPoint).sub(furnitureObject.position);

                event.preventDefault();
                event.stopPropagation();

                console.log("Started dragging 3D furniture:", furnitureObject.name);
            }
        }
    };

    const onMouseMove = (event) => {
        if (!isDraggingRef.current || !selectedObjectRef.current || !scene || !scene.camera) return;

        const canvas = scene.renderer.domElement;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, scene.camera);

        const intersection = new THREE.Vector3();
        const hasIntersection = raycasterRef.current.ray.intersectPlane(planeRef.current, intersection);

        if (hasIntersection) {
            const newPosition = intersection.sub(offsetRef.current);

            let roomWidth = 10;
            let roomLength = 10;

            if (scene) {
                const roomObject = scene.children.find((child) => child.name === "room");
                if (roomObject) {
                    const floor = roomObject.children.find((c) => c.name === "floor");
                    if (floor && floor.geometry) {
                        const size = new THREE.Vector3();
                        new THREE.Box3().setFromObject(floor).getSize(size);
                        roomWidth = size.x;
                        roomLength = size.z;
                    }
                }
            }

            const furniture = placedFurniture.find((item) => item.object === selectedObjectRef.current);

            if (furniture && furniture.dimensions) {
                const halfWidth = furniture.dimensions.width / 2;
                const halfDepth = furniture.dimensions.depth / 2;
                const halfRoomWidth = roomWidth / 2;
                const halfRoomLength = roomLength / 2;

                newPosition.x = Math.max(-halfRoomWidth + halfWidth, Math.min(halfRoomWidth - halfWidth, newPosition.x));
                newPosition.z = Math.max(-halfRoomLength + halfDepth, Math.min(halfRoomLength - halfDepth, newPosition.z));

                // For GLB models, maintain floor contact
                const currentBox = new THREE.Box3().setFromObject(selectedObjectRef.current);
                const currentBottom = currentBox.min.y;
                const yAdjustment = -currentBottom + 0.001;

                selectedObjectRef.current.position.set(
                    newPosition.x,
                    selectedObjectRef.current.position.y + yAdjustment,
                    newPosition.z
                );

                setPlacedFurniture((prev) =>
                    prev.map((item) => {
                        if (item && item.id === furniture.id && selectedObjectRef.current) {
                            return {
                                ...item,
                                position: selectedObjectRef.current.position.clone(),
                            };
                        }
                        return item;
                    })
                );
            }
        }

        event.preventDefault();
    };

    const onMouseUp = (event) => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            selectedObjectRef.current = null;

            if (scene && scene.orbitControls) {
                scene.orbitControls.enabled = true;
            }

            console.log("Finished dragging 3D furniture");
        }
    };

    // Enhanced GLB loading with comprehensive error handling and optimization
    const loadGLBModel = useCallback(async (modelPath, itemName = "Unknown") => {
        if (modelCacheRef.current.has(modelPath)) {
            console.log(`Using cached 3D model: ${modelPath}`);
            return modelCacheRef.current.get(modelPath).clone();
        }

        if (loadingStateRef.current.failedItems.has(modelPath)) {
            throw new Error(`Previously failed to load 3D model: ${modelPath}`);
        }

        return new Promise((resolve, reject) => {
            console.log(`Loading 3D model: ${modelPath} for ${itemName}`);

            const timeout = setTimeout(() => {
                reject(new Error(`Timeout loading 3D model ${modelPath} for ${itemName}`));
            }, 45000); // 45 second timeout for larger models

            // Track loading progress
            loadingStateRef.current.currentItem = itemName;
            loadingStateRef.current.progress = 0;

            gltfLoaderRef.current.load(
                modelPath,
                (gltf) => {
                    clearTimeout(timeout);

                    try {
                        const model = gltf.scene;

                        // Enhanced model processing
                        model.traverse((child) => {
                            if (child.isMesh) {
                                // Enable shadows
                                child.castShadow = true;
                                child.receiveShadow = true;

                                // Enhance materials
                                if (child.material) {
                                    if (Array.isArray(child.material)) {
                                        child.material.forEach(mat => {
                                            if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                                                mat.roughness = mat.roughness || 0.7;
                                                mat.metalness = mat.metalness || 0.1;
                                                mat.envMapIntensity = 0.5;
                                            }
                                        });
                                    } else if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                                        child.material.roughness = child.material.roughness || 0.7;
                                        child.material.metalness = child.material.metalness || 0.1;
                                        child.material.envMapIntensity = 0.5;
                                    }
                                }

                                // Optimize geometry
                                if (child.geometry) {
                                    child.geometry.computeVertexNormals();
                                    if (!child.geometry.attributes.uv) {
                                        console.warn(`Missing UV coordinates for mesh in ${itemName}`);
                                    }
                                }
                            }
                        });

                        // Add model metadata
                        model.userData = {
                            originalPath: modelPath,
                            loadedAt: new Date().toISOString(),
                            itemName: itemName
                        };

                        // Cache the original model
                        modelCacheRef.current.set(modelPath, model);
                        loadingStateRef.current.loadedItems.add(modelPath);
                        loadingStateRef.current.progress = 100;

                        console.log(`Successfully loaded and cached 3D model: ${modelPath} for ${itemName}`);
                        resolve(model.clone());
                    } catch (error) {
                        clearTimeout(timeout);
                        console.error(`Error processing 3D model ${modelPath} for ${itemName}:`, error);
                        loadingStateRef.current.failedItems.add(modelPath);
                        reject(error);
                    }
                },
                (progress) => {
                    if (progress.total > 0) {
                        const percentage = (progress.loaded / progress.total * 100);
                        loadingStateRef.current.progress = percentage;
                        console.log(`3D model loading progress for ${itemName}: ${percentage.toFixed(1)}%`);
                    }
                },
                (error) => {
                    clearTimeout(timeout);
                    console.error(`Error loading 3D model ${modelPath} for ${itemName}:`, error);
                    loadingStateRef.current.failedItems.add(modelPath);
                    loadingStateRef.current.currentItem = null;
                    reject(error);
                }
            );
        });
    }, []);

    const addFurnitureToRoom = useCallback(async (item) => {
        if (!scene) {
            throw new Error("Scene not ready");
        }

        if (loadingStateRef.current.isLoading) {
            throw new Error("Another 3D model is currently loading");
        }

        // Only accept GLB models
        if (!item.isGLB || !item.modelPath) {
            throw new Error("Only 3D GLB models are supported");
        }

        console.log("Adding 3D furniture to room:", item.name);
        loadingStateRef.current.isLoading = true;
        loadingStateRef.current.currentItem = item.name;

        try {
            const id = uuidv4();
            const { width, height, depth } = item.dimensions;

            console.log("Loading 3D model:", item.modelPath);
            const furnitureObject = await loadGLBModel(item.modelPath, item.name);

            // Calculate and apply proper scaling
            const boundingBox = new THREE.Box3().setFromObject(furnitureObject);
            const size = boundingBox.getSize(new THREE.Vector3());

            console.log("Original 3D model size:", size);
            console.log("Target dimensions:", { width, height, depth });

            // Use the largest dimension for uniform scaling
            const scaleX = width / size.x;
            const scaleY = height / size.y;
            const scaleZ = depth / size.z;
            const scale = Math.min(scaleX, scaleY, scaleZ) * 1; // Slightly smaller to fit better

            furnitureObject.scale.setScalar(scale);
            console.log("Applied scale:", scale);

            // Position at room center initially
            furnitureObject.position.set(0, 0, 0);
            furnitureObject.updateMatrixWorld(true);

            // Adjust to sit on floor
            // Adjust to sit on top of floor
            const scaledBox = new THREE.Box3().setFromObject(furnitureObject);
            const bottomY = scaledBox.min.y;
            const floorThickness = 0.05; // must match your room floor thickness
            furnitureObject.position.y = -bottomY + floorThickness + 0.001;


            console.log("3D model positioned at:", furnitureObject.position);

            furnitureObject.name = `furniture-${id}`;
            scene.add(furnitureObject);

            const placedItem = {
                id: id,
                name: item.name,
                type: item.type,
                category: item.category,
                dimensions: item.dimensions,
                color: item.color,
                material: item.material,
                style: item.style,
                price: item.price,
                position: furnitureObject.position.clone(),
                rotation: new THREE.Euler(0, 0, 0),
                object: furnitureObject,
                isGLB: true,
                modelPath: item.modelPath,
                imagePath: item.imagePath,
                appliedScale: scale
            };

            setPlacedFurniture((prev) => {
                const newFurniture = [...prev, placedItem];
                console.log("3D furniture added. Total items:", newFurniture.length);
                return newFurniture;
            });

            return placedItem;
        } catch (error) {
            console.error("Error adding 3D furniture:", error);
            throw error;
        } finally {
            loadingStateRef.current.isLoading = false;
            loadingStateRef.current.currentItem = null;
            loadingStateRef.current.progress = 0;
        }
    }, [scene, loadGLBModel]);

    const rotateFurnitureItem = useCallback((id) => {
        if (!scene) return;

        const itemIndex = placedFurniture.findIndex((item) => item && item.id === id);

        if (itemIndex !== -1) {
            const item = placedFurniture[itemIndex];
            const object = item?.object;

            if (object) {
                object.rotation.y += Math.PI / 4; // 45 degree rotation

                setPlacedFurniture((prev) => {
                    const updated = [...prev];
                    if (updated[itemIndex]) {
                        updated[itemIndex] = {
                            ...item,
                            rotation: new THREE.Euler(
                                object.rotation.x,
                                object.rotation.y,
                                object.rotation.z
                            ),
                        };
                    }
                    return updated;
                });

                console.log("Rotated 3D furniture:", item.name);
            }
        }
    }, [scene, placedFurniture]);

    const removeFurnitureItem = useCallback((id) => {
        if (!scene) return;

        const itemToRemove = placedFurniture.find((item) => item && item.id === id);

        if (itemToRemove && itemToRemove.object) {
            scene.remove(itemToRemove.object);

            // Comprehensive cleanup for 3D models
            const disposeObject = (obj) => {
                if (obj.geometry) {
                    obj.geometry.dispose();
                }

                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach((material) => {
                            if (material.map) material.map.dispose();
                            if (material.normalMap) material.normalMap.dispose();
                            if (material.roughnessMap) material.roughnessMap.dispose();
                            if (material.metalnessMap) material.metalnessMap.dispose();
                            if (material.aoMap) material.aoMap.dispose();
                            material.dispose();
                        });
                    } else {
                        if (obj.material.map) obj.material.map.dispose();
                        if (obj.material.normalMap) obj.material.normalMap.dispose();
                        if (obj.material.roughnessMap) obj.material.roughnessMap.dispose();
                        if (obj.material.metalnessMap) obj.material.metalnessMap.dispose();
                        if (obj.material.aoMap) obj.material.aoMap.dispose();
                        obj.material.dispose();
                    }
                }
            };

            itemToRemove.object.traverse(disposeObject);

            setPlacedFurniture((prev) => {
                const newFurniture = prev.filter((item) => item && item.id !== id);
                console.log("3D furniture removed. Remaining items:", newFurniture.length);
                return newFurniture;
            });

            console.log("Removed 3D furniture:", itemToRemove.name);
        }
    }, [scene, placedFurniture]);

    const clearAllFurniture = useCallback(() => {
        if (!scene) return;

        console.log("Clearing all 3D furniture...");

        placedFurniture.forEach((item) => {
            if (item && item.object) {
                scene.remove(item.object);

                const disposeObject = (obj) => {
                    if (obj.geometry) {
                        obj.geometry.dispose();
                    }

                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach((material) => {
                                if (material.map) material.map.dispose();
                                if (material.normalMap) material.normalMap.dispose();
                                if (material.roughnessMap) material.roughnessMap.dispose();
                                if (material.metalnessMap) material.metalnessMap.dispose();
                                if (material.aoMap) material.aoMap.dispose();
                                material.dispose();
                            });
                        } else {
                            if (obj.material.map) obj.material.map.dispose();
                            if (obj.material.normalMap) obj.material.normalMap.dispose();
                            if (obj.material.roughnessMap) obj.material.roughnessMap.dispose();
                            if (obj.material.metalnessMap) obj.material.metalnessMap.dispose();
                            if (obj.material.aoMap) obj.material.aoMap.dispose();
                            obj.material.dispose();
                        }
                    }
                };

                item.object.traverse(disposeObject);
            }
        });

        setPlacedFurniture([]);

        // Clear loading state but keep cache for performance
        loadingStateRef.current = {
            isLoading: false,
            currentItem: null,
            progress: 0,
            loadedItems: new Set(),
            failedItems: new Set(),
            totalItems: 0,
            completedItems: 0
        };

        console.log("All 3D furniture cleared");
    }, [scene, placedFurniture]);

    // Enhanced furniture loading from configuration with better GLB handling
    const loadFurnitureFromConfig = useCallback(async (furnitureList) => {
        if (!scene || !Array.isArray(furnitureList)) {
            console.warn("Scene not ready or invalid furniture list");
            return { loaded: [], errors: ["Scene not ready or invalid furniture list"] };
        }

        if (furnitureList.length === 0) {
            console.log("No 3D furniture to load");
            return { loaded: [], errors: [] };
        }

        // Filter only GLB models
        const glbFurniture = furnitureList.filter(item => item.isGLB && item.modelPath);

        if (glbFurniture.length !== furnitureList.length) {
            console.warn(`Filtered out ${furnitureList.length - glbFurniture.length} non-GLB items`);
        }

        console.log("Loading 3D furniture from configuration:", glbFurniture.length, "GLB models");

        const loadedItems = [];
        const errors = [];
        let loadedCount = 0;

        loadingStateRef.current.totalItems = glbFurniture.length;
        loadingStateRef.current.completedItems = 0;

        // Load furniture items sequentially for better stability
        for (const savedItem of glbFurniture) {
            try {
                console.log(`Loading 3D furniture ${loadedCount + 1}/${glbFurniture.length}: ${savedItem.name}`);
                loadingStateRef.current.currentItem = savedItem.name;

                const furnitureObject = await loadGLBModel(savedItem.modelPath, savedItem.name);

                // Apply saved scale if available
                if (savedItem.glbData && savedItem.glbData.appliedScale) {
                    console.log(`Applying saved scale: ${savedItem.glbData.appliedScale}`);
                    furnitureObject.scale.setScalar(savedItem.glbData.appliedScale);
                } else if (savedItem.appliedScale) {
                    console.log(`Applying saved scale from item: ${savedItem.appliedScale}`);
                    furnitureObject.scale.setScalar(savedItem.appliedScale);
                } else {
                    // Calculate new scale based on dimensions
                    console.log("No saved scale data, calculating new scale");
                    const boundingBox = new THREE.Box3().setFromObject(furnitureObject);
                    const size = boundingBox.getSize(new THREE.Vector3());
                    const scaleX = savedItem.dimensions.width / size.x;
                    const scaleY = savedItem.dimensions.height / size.y;
                    const scaleZ = savedItem.dimensions.depth / size.z;
                    const scale = Math.min(scaleX, scaleY, scaleZ) * 0.9;
                    furnitureObject.scale.setScalar(scale);
                }

                furnitureObject.updateMatrixWorld(true);

                // Apply saved position
                if (savedItem.glbData && savedItem.glbData.floorOffset !== undefined) {
                    console.log(`Applying saved floor offset: ${savedItem.glbData.floorOffset}`);
                    furnitureObject.position.set(
                        savedItem.position.x,
                        savedItem.glbData.floorOffset,
                        savedItem.position.z
                    );
                } else {
                    console.log("No saved floor offset, calculating new position");
                    const scaledBox = new THREE.Box3().setFromObject(furnitureObject);
                    const bottomY = scaledBox.min.y;
                    furnitureObject.position.set(
                        savedItem.position.x,
                        -bottomY + 0.001,
                        savedItem.position.z
                    );
                }

                // Apply saved rotation
                if (savedItem.rotation) {
                    furnitureObject.rotation.set(
                        savedItem.rotation.x,
                        savedItem.rotation.y,
                        savedItem.rotation.z
                    );
                }

                furnitureObject.name = `furniture-${savedItem.id}`;
                scene.add(furnitureObject);

                const loadedItem = {
                    id: savedItem.id,
                    name: savedItem.name,
                    type: savedItem.type,
                    category: savedItem.category,
                    dimensions: savedItem.dimensions,
                    color: savedItem.color,
                    material: savedItem.material,
                    style: savedItem.style,
                    price: savedItem.price,
                    position: furnitureObject.position.clone(),
                    rotation: furnitureObject.rotation.clone(),
                    object: furnitureObject,
                    isGLB: true,
                    modelPath: savedItem.modelPath,
                    imagePath: savedItem.imagePath,
                    appliedScale: furnitureObject.scale.x
                };

                loadedItems.push(loadedItem);
                loadedCount++;
                loadingStateRef.current.completedItems = loadedCount;

                console.log(`Successfully loaded 3D furniture: ${savedItem.name} (${loadedCount}/${glbFurniture.length})`);

                // Small delay between items to prevent conflicts
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error("Error loading 3D furniture item:", error);
                errors.push(`Failed to load 3D model ${savedItem.name}: ${error.message}`);
                loadingStateRef.current.completedItems++;
            }
        }

        // Update state with loaded furniture
        setPlacedFurniture(prevFurniture => {
            const newFurniture = [...prevFurniture, ...loadedItems];
            console.log(`3D furniture loading complete. Total items: ${newFurniture.length}`);
            return newFurniture;
        });

        // Reset loading state
        loadingStateRef.current = {
            isLoading: false,
            currentItem: null,
            progress: 0,
            loadedItems: loadingStateRef.current.loadedItems,
            failedItems: loadingStateRef.current.failedItems,
            totalItems: 0,
            completedItems: 0
        };

        if (errors.length > 0) {
            console.warn("Some 3D furniture items failed to load:", errors);
        } else {
            console.log("All 3D furniture loaded successfully");
        }

        return { loaded: loadedItems, errors };
    }, [scene, loadGLBModel]);

    // Clear model cache when component unmounts or scene changes
    useEffect(() => {
        return () => {
            console.log("Clearing 3D model cache...");
            modelCacheRef.current.clear();
            loadingStateRef.current = {
                isLoading: false,
                currentItem: null,
                progress: 0,
                loadedItems: new Set(),
                failedItems: new Set(),
                totalItems: 0,
                completedItems: 0
            };
        };
    }, [scene]);

    // Utility function to get loading state
    const getLoadingState = useCallback(() => {
        return {
            isLoading: loadingStateRef.current.isLoading,
            currentItem: loadingStateRef.current.currentItem,
            progress: loadingStateRef.current.progress,
            loadedCount: loadingStateRef.current.loadedItems.size,
            failedCount: loadingStateRef.current.failedItems.size,
            cacheSize: modelCacheRef.current.size,
            totalItems: loadingStateRef.current.totalItems,
            completedItems: loadingStateRef.current.completedItems
        };
    }, []);

    // Function to clear model cache manually
    const clearModelCache = useCallback(() => {
        console.log("Manually clearing 3D model cache...");
        modelCacheRef.current.clear();
        loadingStateRef.current.loadedItems.clear();
        loadingStateRef.current.failedItems.clear();
    }, []);

    // Function to preload 3D models
    const preloadModels = useCallback(async (modelPaths) => {
        if (!Array.isArray(modelPaths)) return;

        console.log(`Preloading ${modelPaths.length} 3D models...`);
        const results = [];

        for (const modelPath of modelPaths) {
            try {
                await loadGLBModel(modelPath, `Preload-${modelPath.split('/').pop()}`);
                results.push({ modelPath, success: true });
                console.log(`Preloaded 3D model: ${modelPath}`);
            } catch (error) {
                results.push({ modelPath, success: false, error: error.message });
                console.error(`Failed to preload 3D model: ${modelPath}`, error);
            }
        }

        return results;
    }, [loadGLBModel]);

    // Function to get model info from cache
    const getModelInfo = useCallback((modelPath) => {
        if (modelCacheRef.current.has(modelPath)) {
            const model = modelCacheRef.current.get(modelPath);
            const boundingBox = new THREE.Box3().setFromObject(model);
            const size = boundingBox.getSize(new THREE.Vector3());

            return {
                cached: true,
                size: size,
                userData: model.userData,
                triangles: model.traverse ? (() => {
                    let count = 0;
                    model.traverse(child => {
                        if (child.isMesh && child.geometry) {
                            count += child.geometry.index ?
                                child.geometry.index.count / 3 :
                                child.geometry.attributes.position.count / 3;
                        }
                    });
                    return Math.floor(count);
                })() : 0
            };
        }
        return { cached: false };
    }, []);

    return {
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
        gltfLoader: gltfLoaderRef.current,
        getLoadingState,
        clearModelCache,
        preloadModels,
        getModelInfo,
    };
};