import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

/**
 * Enhanced first-person controls for room exploration
 */
export const useFirstPersonControls = (
    scene,
    camera,
    renderer,
    roomDimensions
) => {
    const controlsRef = useRef(null);
    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
        canJump: true,
        isRunning: false,
    });

    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const prevTime = useRef(performance.now());
    const [isLocked, setIsLocked] = useState(false);

    // Movement constants
    const WALK_SPEED = 3.0;
    const RUN_SPEED = 6.0;
    const JUMP_VELOCITY = 8.0;
    const GRAVITY = 20.0;
    const FRICTION = 10.0;
    const EYE_HEIGHT = 1.7; // Average human eye height
    const COLLISION_MARGIN = 0.3; // Distance from walls

    useEffect(() => {
        if (!scene || !camera || !renderer) return;

        // Create pointer lock controls
        const controls = new PointerLockControls(camera, renderer.domElement);
        controlsRef.current = controls;

        // Set initial camera position
        camera.position.set(0, EYE_HEIGHT, 0);

        // Event handlers
        const onLock = () => {
            setIsLocked(true);
            // Hide cursor and show instructions
            document.body.style.cursor = "none";
            showInstructions();
        };

        const onUnlock = () => {
            setIsLocked(false);
            // Show cursor and hide instructions
            document.body.style.cursor = "auto";
            hideInstructions();
        };

        // Add event listeners
        controls.addEventListener("lock", onLock);
        controls.addEventListener("unlock", onUnlock);

        // Add pointer lock on click
        const onRendererClick = () => {
            if (!controls.isLocked) {
                controls.lock();
            }
        };

        renderer.domElement.addEventListener("click", onRendererClick);

        // Keyboard event handlers
        const onKeyDown = (event) => {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    moveState.current.forward = true;
                    break;
                case "ArrowLeft":
                case "KeyA":
                    moveState.current.left = true;
                    break;
                case "ArrowDown":
                case "KeyS":
                    moveState.current.backward = true;
                    break;
                case "ArrowRight":
                case "KeyD":
                    moveState.current.right = true;
                    break;
                case "Space":
                    if (moveState.current.canJump) {
                        velocity.current.y = JUMP_VELOCITY;
                        moveState.current.canJump = false;
                    }
                    event.preventDefault();
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    moveState.current.isRunning = true;
                    break;
                case "Escape":
                    if (controls.isLocked) {
                        controls.unlock();
                    }
                    break;
                default:
                    break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    moveState.current.forward = false;
                    break;
                case "ArrowLeft":
                case "KeyA":
                    moveState.current.left = false;
                    break;
                case "ArrowDown":
                case "KeyS":
                    moveState.current.backward = false;
                    break;
                case "ArrowRight":
                case "KeyD":
                    moveState.current.right = false;
                    break;
                case "ShiftLeft":
                case "ShiftRight":
                    moveState.current.isRunning = false;
                    break;
                default:
                    break;
            }
        };

        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);

        // Animation loop
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            if (controls.isLocked) {
                updateMovement();
            }
        };
        animate();

        // Movement update function
        const updateMovement = () => {
            const time = performance.now();
            const delta = (time - prevTime.current) / 1000;
            prevTime.current = time;

            // Apply friction
            velocity.current.x -= velocity.current.x * FRICTION * delta;
            velocity.current.z -= velocity.current.z * FRICTION * delta;

            // Apply gravity
            velocity.current.y -= GRAVITY * 100 * delta;

            // Calculate movement direction
            direction.current.z =
                Number(moveState.current.forward) - Number(moveState.current.backward);
            direction.current.x =
                Number(moveState.current.right) - Number(moveState.current.left);
            direction.current.normalize();

            // Apply movement speed
            const currentSpeed = moveState.current.isRunning ? RUN_SPEED : WALK_SPEED;

            if (moveState.current.forward || moveState.current.backward) {
                velocity.current.z -= direction.current.z * currentSpeed * 100 * delta;
            }
            if (moveState.current.left || moveState.current.right) {
                velocity.current.x -= direction.current.x * currentSpeed * 100 * delta;
            }

            // Move the camera
            controls.moveRight(-velocity.current.x * delta);
            controls.moveForward(-velocity.current.z * delta);

            // Handle vertical movement and collision
            const object = controls.getObject();
            object.position.y += velocity.current.y * delta;

            // Floor collision
            if (object.position.y < EYE_HEIGHT) {
                velocity.current.y = 0;
                object.position.y = EYE_HEIGHT;
                moveState.current.canJump = true;
            }

            // Wall collisions
            if (roomDimensions) {
                checkWallCollisions(object);
            }
        };

        // Wall collision detection
        const checkWallCollisions = (object) => {
            const { width, length } = roomDimensions;
            const halfWidth = width / 2;
            const halfLength = length / 2;

            // Check X boundaries (width)
            if (object.position.x < -halfWidth + COLLISION_MARGIN) {
                object.position.x = -halfWidth + COLLISION_MARGIN;
                velocity.current.x = 0;
            } else if (object.position.x > halfWidth - COLLISION_MARGIN) {
                object.position.x = halfWidth - COLLISION_MARGIN;
                velocity.current.x = 0;
            }

            // Check Z boundaries (length)
            if (object.position.z < -halfLength + COLLISION_MARGIN) {
                object.position.z = -halfLength + COLLISION_MARGIN;
                velocity.current.z = 0;
            } else if (object.position.z > halfLength - COLLISION_MARGIN) {
                object.position.z = halfLength - COLLISION_MARGIN;
                velocity.current.z = 0;
            }
        };

        // Cleanup function
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }

            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
            renderer.domElement.removeEventListener("click", onRendererClick);

            controls.removeEventListener("lock", onLock);
            controls.removeEventListener("unlock", onUnlock);

            hideInstructions();

            if (controls) {
                controls.dispose();
            }
        };
    }, [scene, camera, renderer, roomDimensions]);

    // Show/hide instructions
    const showInstructions = () => {
        let instructionsEl = document.getElementById("fp-instructions");
        if (!instructionsEl) {
            instructionsEl = document.createElement("div");
            instructionsEl.id = "fp-instructions";
            instructionsEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 1000;
        pointer-events: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
      `;
            instructionsEl.innerHTML = `
        <div style="text-align: center;">
          <div style="margin-bottom: 10px; font-weight: bold; color: #4CAF50;">🎮 First Person Mode Active</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px;">
            <div>🖱️ Mouse: Look around</div>
            <div>⌨️ WASD: Move</div>
            <div>⇧ Shift: Run</div>
            <div>␣ Space: Jump</div>
            <div>⎋ ESC: Exit</div>
            <div>🚶 Speed: ${moveState.current?.isRunning ? "Running" : "Walking"
                }</div>
          </div>
        </div>
      `;
            document.body.appendChild(instructionsEl);
        }
        instructionsEl.style.display = "block";
    };

    const hideInstructions = () => {
        const instructionsEl = document.getElementById("fp-instructions");
        if (instructionsEl) {
            instructionsEl.remove();
        }
    };

    // Toggle controls lock
    const toggleControlsLock = () => {
        if (!controlsRef.current) return;

        if (controlsRef.current.isLocked) {
            controlsRef.current.unlock();
        } else {
            controlsRef.current.lock();
        }
    };

    // Reset position to center of room
    const resetPosition = () => {
        if (controlsRef.current) {
            const object = controlsRef.current.getObject();
            object.position.set(0, EYE_HEIGHT, 0);
            velocity.current.set(0, 0, 0);
        }
    };

    // Get current position info
    const getPositionInfo = () => {
        if (!controlsRef.current) return null;

        const object = controlsRef.current.getObject();
        return {
            position: object.position.clone(),
            isLocked: isLocked,
            canJump: moveState.current.canJump,
            isRunning: moveState.current.isRunning,
        };
    };

    return {
        controls: controlsRef.current,
        toggleControlsLock,
        resetPosition,
        getPositionInfo,
        isLocked,
    };
};