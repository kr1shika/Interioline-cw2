import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const useRoomScene = (mountRef) => {
    const [scene, setScene] = useState(null);
    const [camera, setCamera] = useState(null);
    const [renderer, setRenderer] = useState(null);
    const [controls, setControls] = useState(null);
    const [roomObject, setRoomObject] = useState(null);
    const [currentRoomDimensions, setCurrentRoomDimensions] = useState({ width: 13, length: 10, height: 5 });

    const doorsRef = useRef([]);
    const windowsRef = useRef([]);

    const setupLighting = useCallback((scene) => {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -15;
        directionalLight.shadow.camera.right = 15;
        directionalLight.shadow.camera.top = 15;
        directionalLight.shadow.camera.bottom = -15;
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight.position.set(-8, 15, -8);
        scene.add(fillLight);
    }, []);

    const createRoom = useCallback((dimensions, wallColor, floorColor) => {
        const { width, length, height } = dimensions;
        const roomGroup = new THREE.Group();
        roomGroup.name = 'room';

        const floorGeometry = new THREE.PlaneGeometry(width, length);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: floorColor,
            roughness: 0.8,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.name = 'floor';
        roomGroup.add(floor);

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: wallColor,
            roughness: 0.9,
            metalness: 0.1
        });

        const northWallGeometry = new THREE.PlaneGeometry(width, height);
        const northWall = new THREE.Mesh(northWallGeometry, wallMaterial.clone());
        northWall.position.set(0, height / 2, -length / 2);
        northWall.name = 'northWall';
        northWall.receiveShadow = true;
        roomGroup.add(northWall);

        const southWall = new THREE.Mesh(northWallGeometry, wallMaterial.clone());
        southWall.position.set(0, height / 2, length / 2);
        southWall.rotation.y = Math.PI;
        southWall.name = 'southWall';
        southWall.receiveShadow = true;
        roomGroup.add(southWall);

        const eastWallGeometry = new THREE.PlaneGeometry(length, height);
        const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial.clone());
        eastWall.position.set(width / 2, height / 2, 0);
        eastWall.rotation.y = -Math.PI / 2;
        eastWall.name = 'eastWall';
        eastWall.receiveShadow = true;
        roomGroup.add(eastWall);

        const westWall = new THREE.Mesh(eastWallGeometry, wallMaterial.clone());
        westWall.position.set(-width / 2, height / 2, 0);
        westWall.rotation.y = Math.PI / 2;
        westWall.name = 'westWall';
        westWall.receiveShadow = true;
        roomGroup.add(westWall);

        const ceilingGeometry = new THREE.PlaneGeometry(width, length);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 0.9,
            metalness: 0.0
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = height;
        ceiling.receiveShadow = true;
        ceiling.name = 'ceiling';
        roomGroup.add(ceiling);

        return roomGroup;
    }, []);

    const positionDoorOnWall = useCallback((doorGroup, doorData, roomDimensions) => {
        const { width, length } = roomDimensions;

        switch (doorData.wall) {
            case 'north':
                doorGroup.position.set(doorData.position - width / 2, 0, -length / 2);
                break;
            case 'south':
                doorGroup.position.set(doorData.position - width / 2, 0, length / 2);
                doorGroup.rotation.y = Math.PI;
                break;
            case 'east':
                doorGroup.position.set(width / 2, 0, doorData.position - length / 2);
                doorGroup.rotation.y = -Math.PI / 2;
                break;
            case 'west':
                doorGroup.position.set(-width / 2, 0, doorData.position - length / 2);
                doorGroup.rotation.y = Math.PI / 2;
                break;
            default:
                break;
        }
    }, []);

    const positionWindowOnWall = useCallback((windowGroup, windowData, roomDimensions) => {
        const { width, length } = roomDimensions;

        switch (windowData.wall) {
            case 'north':
                windowGroup.position.set(windowData.position - width / 2, 0, -length / 2);
                break;
            case 'south':
                windowGroup.position.set(windowData.position - width / 2, 0, length / 2);
                windowGroup.rotation.y = Math.PI;
                break;
            case 'east':
                windowGroup.position.set(width / 2, 0, windowData.position - length / 2);
                windowGroup.rotation.y = -Math.PI / 2;
                break;
            case 'west':
                windowGroup.position.set(-width / 2, 0, windowData.position - length / 2);
                windowGroup.rotation.y = Math.PI / 2;
                break;
            default:
                break;
        }
    }, []);

    const createDoor = useCallback((doorData, roomDimensions) => {
        const doorGroup = new THREE.Group();
        doorGroup.name = `door-${doorData.id}`;

        const frameThickness = 0.06;
        const frameDepth = 0.2;
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: '#8B4513',
            roughness: 0.8,
            metalness: 0.1
        });

        const leftFrameGeometry = new THREE.BoxGeometry(frameThickness, doorData.height + frameThickness, frameDepth);
        const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
        leftFrame.position.set(-doorData.width / 2 - frameThickness / 2, doorData.height / 2, 0);

        const rightFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
        rightFrame.position.set(doorData.width / 2 + frameThickness / 2, doorData.height / 2, 0);

        const topFrameGeometry = new THREE.BoxGeometry(doorData.width + frameThickness * 2, frameThickness, frameDepth);
        const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
        topFrame.position.set(0, doorData.height + frameThickness / 2, 0);

        doorGroup.add(leftFrame, rightFrame, topFrame);

        const doorGeometry = new THREE.BoxGeometry(doorData.width, doorData.height, 0.05);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: '#654321',
            roughness: 0.8,
            metalness: 0.1
        });
        const doorPanel = new THREE.Mesh(doorGeometry, doorMaterial);
        doorPanel.position.set(0, doorData.height / 2, 0.025);
        doorPanel.castShadow = true;
        doorPanel.receiveShadow = true;
        doorGroup.add(doorPanel);

        const handleGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: '#FFD700',
            roughness: 0.2,
            metalness: 0.8
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(doorData.width / 2 - 0.15, doorData.height / 2, 0.1);
        handle.castShadow = true;
        doorGroup.add(handle);

        positionDoorOnWall(doorGroup, doorData, roomDimensions);

        return doorGroup;
    }, [positionDoorOnWall]);

    const createWindow = useCallback((windowData, roomDimensions) => {
        const windowGroup = new THREE.Group();
        windowGroup.name = `window-${windowData.id}`;

        const frameThickness = 0.08;
        const frameDepth = 0.15;
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            roughness: 0.3,
            metalness: 0.0
        });

        const verticalFrameGeometry = new THREE.BoxGeometry(frameThickness, windowData.height + frameThickness, frameDepth);
        const leftFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
        leftFrame.position.set(-windowData.width / 2 - frameThickness / 2, windowData.sillHeight + windowData.height / 2, 0);

        const rightFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
        rightFrame.position.set(windowData.width / 2 + frameThickness / 2, windowData.sillHeight + windowData.height / 2, 0);

        const horizontalFrameGeometry = new THREE.BoxGeometry(windowData.width + frameThickness * 2, frameThickness, frameDepth);
        const topFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
        topFrame.position.set(0, windowData.sillHeight + windowData.height + frameThickness / 2, 0);

        const bottomFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
        bottomFrame.position.set(0, windowData.sillHeight - frameThickness / 2, 0);

        windowGroup.add(leftFrame, rightFrame, topFrame, bottomFrame);

        const glassGeometry = new THREE.PlaneGeometry(windowData.width - 0.02, windowData.height - 0.02);
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            roughness: 0.0,
            metalness: 0.0
        });

        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.set(0, windowData.sillHeight + windowData.height / 2, 0);
        windowGroup.add(glass);

        const sillGeometry = new THREE.BoxGeometry(windowData.width + 0.3, 0.08, 0.2);
        const sillMaterial = new THREE.MeshStandardMaterial({
            color: '#f0f0f0',
            roughness: 0.4,
            metalness: 0.0
        });
        const sill = new THREE.Mesh(sillGeometry, sillMaterial);
        sill.position.set(0, windowData.sillHeight - 0.04, 0.05);
        sill.castShadow = true;
        sill.receiveShadow = true;
        windowGroup.add(sill);

        positionWindowOnWall(windowGroup, windowData, roomDimensions);

        return windowGroup;
    }, [positionWindowOnWall]);

    useEffect(() => {
        if (!mountRef.current) return;

        // Capture the current mount element to avoid stale closure
        const currentMount = mountRef.current;

        const newScene = new THREE.Scene();
        newScene.background = new THREE.Color(0xf0f8ff);

        const newCamera = new THREE.PerspectiveCamera(
            75,
            currentMount.clientWidth / currentMount.clientHeight,
            0.1,
            1000
        );
        newCamera.position.set(8, 6, 8);
        newCamera.lookAt(0, 0, 0);

        const newRenderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        newRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        newRenderer.shadowMap.enabled = true;
        newRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        currentMount.appendChild(newRenderer.domElement);

        const newControls = new OrbitControls(newCamera, newRenderer.domElement);
        newControls.target.set(0, 1, 0);
        newControls.enableDamping = true;
        newControls.dampingFactor = 0.05;
        newControls.minDistance = 3;
        newControls.maxDistance = 30;
        newControls.maxPolarAngle = Math.PI / 2 - 0.1;
        newControls.update();

        newScene.orbitControls = newControls;
        newScene.camera = newCamera;
        newScene.renderer = newRenderer;

        setupLighting(newScene);

        const animate = () => {
            requestAnimationFrame(animate);
            newControls.update();
            newRenderer.render(newScene, newCamera);
        };
        animate();

        const handleResize = () => {
            if (currentMount) {
                newCamera.aspect = currentMount.clientWidth / currentMount.clientHeight;
                newCamera.updateProjectionMatrix();
                newRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // Update state
        setScene(newScene);
        setCamera(newCamera);
        setRenderer(newRenderer);
        setControls(newControls);

        const initialRoom = createRoom(currentRoomDimensions, '#f8f8f8', '#d4b896');
        newScene.add(initialRoom);
        setRoomObject(initialRoom);

        return () => {
            window.removeEventListener('resize', handleResize);

            // Use captured mount element instead of ref
            if (newRenderer && currentMount && currentMount.contains(newRenderer.domElement)) {
                currentMount.removeChild(newRenderer.domElement);
            }

            if (newControls) newControls.dispose();
            if (newRenderer) newRenderer.dispose();
        };
    }, [mountRef, createRoom, currentRoomDimensions, setupLighting]);

    const updateRoomDimensions = useCallback((dimensions, onComplete) => {
        if (!scene) return;

        setCurrentRoomDimensions(dimensions);

        if (roomObject) {
            scene.remove(roomObject);

            const newRoom = createRoom(dimensions, '#f8f8f8', '#d4b896');
            scene.add(newRoom);
            setRoomObject(newRoom);

            if (onComplete) onComplete(1);
        }
    }, [scene, roomObject, createRoom]);

    const updateDoors = useCallback((doors) => {
        if (!scene || !roomObject) return;

        console.log('Updating doors:', doors);

        doorsRef.current.forEach(door => {
            roomObject.remove(door);
        });
        doorsRef.current = [];

        const newDoors = doors.map(doorData => {
            const doorMesh = createDoor(doorData, currentRoomDimensions);
            roomObject.add(doorMesh);
            return doorMesh;
        });

        doorsRef.current = newDoors;
        console.log('Doors updated:', newDoors.length);
    }, [scene, roomObject, currentRoomDimensions, createDoor]);

    const updateWindows = useCallback((windows) => {
        if (!scene || !roomObject) return;

        console.log('Updating windows:', windows);

        // Remove existing windows
        windowsRef.current.forEach(window => {
            roomObject.remove(window);
        });
        windowsRef.current = [];

        // Add new windows
        const newWindows = windows.map(windowData => {
            const windowMesh = createWindow(windowData, currentRoomDimensions);
            roomObject.add(windowMesh);
            return windowMesh;
        });

        windowsRef.current = newWindows;
        console.log('Windows updated:', newWindows.length);
    }, [scene, roomObject, currentRoomDimensions, createWindow]);

    const updateWallColor = useCallback((color) => {
        if (!roomObject) return;

        roomObject.traverse((object) => {
            if (object instanceof THREE.Mesh && object.name && object.name.includes('Wall')) {
                object.material.color.set(color);
                object.material.needsUpdate = true;
            }
        });
    }, [roomObject]);

    const updateFloorColor = useCallback((color) => {
        if (!roomObject) return;

        roomObject.traverse((object) => {
            if (object instanceof THREE.Mesh && object.name === 'floor') {
                object.material.color.set(color);
                object.material.needsUpdate = true;
            }
        });
    }, [roomObject]);

    return {
        scene,
        camera,
        renderer,
        controls,
        roomObject,
        updateRoomDimensions,
        updateDoors,
        updateWindows,
        updateWallColor,
        updateFloorColor
    };
};