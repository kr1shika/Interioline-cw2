// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { furnitureCatalog } from "./editingRoom/components/room-designer/furniture-Catalog";

// const DemoRoomPreview = () => {
//     const mountRef = useRef(null);
//     const hoverRef = useRef(null);
//     const selectedRef = useRef(null);
//     const offsetRef = useRef(new THREE.Vector3());
//     const raycaster = new THREE.Raycaster();
//     const mouse = new THREE.Vector2();
//     const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
//     const furnitureMeshes = useRef([]);

//     useEffect(() => {
//         const scene = new THREE.Scene();
//         scene.background = new THREE.Color("#f2f1ec");

//         const camera = new THREE.PerspectiveCamera(
//             60,
//             mountRef.current.clientWidth / mountRef.current.clientHeight,
//             0.1,
//             1000
//         );
//         camera.position.set(5, 5, 5);
//         camera.lookAt(0, 0, 0);

//         const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//         renderer.setSize(
//             mountRef.current.clientWidth,
//             mountRef.current.clientHeight
//         );
//         renderer.shadowMap.enabled = true;
//         mountRef.current.appendChild(renderer.domElement);

//         const controls = new OrbitControls(camera, renderer.domElement);
//         controls.enableDamping = true;
//         controls.enablePan = false;
//         controls.maxPolarAngle = Math.PI / 2.3;
//         controls.minPolarAngle = Math.PI / 3;
//         controls.minDistance = 4;
//         controls.maxDistance = 6;

//         // Lights
//         scene.add(new THREE.AmbientLight(0xffffff, 0.6));
//         const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
//         dirLight.position.set(10, 10, 5);
//         dirLight.castShadow = true;
//         scene.add(dirLight);

//         // Floor with texture
//         const floorTexture = new THREE.TextureLoader().load("/textures/wood-floor.jpg");
//         floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
//         floorTexture.repeat.set(4, 4);
//         const floor = new THREE.Mesh(
//             new THREE.PlaneGeometry(8, 8),
//             new THREE.MeshStandardMaterial({ map: floorTexture })
//         );
//         floor.rotation.x = -Math.PI / 2;
//         floor.receiveShadow = true;
//         scene.add(floor);

//         // Walls
//         const wallColor = new THREE.Color("#eae6df");
//         const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
//         const wallThickness = 0.1;
//         const wallHeight = 2.5;

//         const walls = [
//             new THREE.Mesh(new THREE.BoxGeometry(8, wallHeight, wallThickness), wallMaterial), // back
//             new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 8), wallMaterial), // left
//             new THREE.Mesh(new THREE.BoxGeometry(8, wallHeight, wallThickness), wallMaterial), // front
//             new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 8), wallMaterial), // right
//         ];

//         walls[0].position.set(0, wallHeight / 2, -4);
//         walls[1].position.set(-4, wallHeight / 2, 0);
//         walls[2].position.set(0, wallHeight / 2, 4);
//         walls[3].position.set(4, wallHeight / 2, 0);

//         walls.forEach(w => {
//             w.castShadow = false;
//             w.receiveShadow = true;
//             scene.add(w);
//         });

//         // Load some demo furniture
//         const loader = new GLTFLoader();
//         const demoItems = furnitureCatalog.slice(0, 3);

//         demoItems.forEach((item, index) => {
//             loader.load(item.modelPath, gltf => {
//                 const model = gltf.scene;
//                 model.position.set(-2 + index * 2.5, 0, 0);
//                 model.scale.setScalar(item.scale || 1);

//                 model.traverse(child => {
//                     if (child.isMesh) {
//                         child.castShadow = true;
//                         child.receiveShadow = true;
//                         child.userData.isFurniture = true;
//                     }
//                 });

//                 furnitureMeshes.current.push(model);
//                 scene.add(model);
//             });
//         });

//         // Interaction
//         const getIntersects = (event) => {
//             const rect = renderer.domElement.getBoundingClientRect();
//             mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//             mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
//             raycaster.setFromCamera(mouse, camera);
//             return raycaster.intersectObjects(furnitureMeshes.current, true);
//         };

//         const onMouseMove = (event) => {
//             const intersects = getIntersects(event);

//             if (hoverRef.current && hoverRef.current.material) {
//                 if (Array.isArray(hoverRef.current.material)) {
//                     hoverRef.current.material.forEach(mat => mat.emissive?.setHex(0x000000));
//                 } else {
//                     hoverRef.current.material.emissive?.setHex(0x000000);
//                 }
//                 hoverRef.current = null;
//             }

//             if (intersects.length > 0) {
//                 let hovered = intersects[0].object;
//                 while (hovered.parent && !furnitureMeshes.current.includes(hovered)) {
//                     hovered = hovered.parent;
//                 }

//                 if (hovered.material) {
//                     if (Array.isArray(hovered.material)) {
//                         hovered.material.forEach(mat => mat.emissive?.setHex(0x00ffcc));
//                     } else if (hovered.material.emissive) {
//                         hovered.material.emissive.setHex(0x00ffcc);
//                     }
//                     hoverRef.current = hovered;
//                 }
//             }

//             if (!selectedRef.current) return;

//             const intersect = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
//             if (intersect) {
//                 selectedRef.current.position
//                     .copy(intersect)
//                     .sub(offsetRef.current)
//                     .setY(0);
//             }
//         };

//         const onMouseDown = (event) => {
//             const intersects = getIntersects(event);
//             if (intersects.length === 0) return;

//             let selected = intersects[0].object;
//             while (selected.parent && !furnitureMeshes.current.includes(selected)) {
//                 selected = selected.parent;
//             }

//             const point = intersects[0].point;
//             offsetRef.current.copy(point).sub(selected.position);
//             selectedRef.current = selected;
//         };

//         const onMouseUp = () => {
//             selectedRef.current = null;
//         };

//         renderer.domElement.addEventListener("mousemove", onMouseMove);
//         renderer.domElement.addEventListener("mousedown", onMouseDown);
//         renderer.domElement.addEventListener("mouseup", onMouseUp);

//         const animate = () => {
//             requestAnimationFrame(animate);
//             controls.update();
//             renderer.render(scene, camera);
//         };
//         animate();

//         return () => {
//             renderer.domElement.remove();
//         };
//     }, []);

//     return (
//         <div
//             ref={mountRef}
//             style={{
//                 width: "100%",
//                 height: "600px",
//                 borderRadius: "12px",
//                 overflow: "hidden",
//                 boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
//                 backgroundColor: "#fff"
//             }}
//         />
//     );
// };

// export default DemoRoomPreview;
