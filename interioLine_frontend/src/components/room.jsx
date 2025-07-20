import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './room.css';

function ThreeCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const getCanvasSize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                return {
                    w: Math.min(parentRect.width, window.innerWidth),
                    h: Math.min(parentRect.height, window.innerHeight * 0.6),
                };
            }
            return { w: window.innerWidth, h: window.innerHeight };
        };

        let sizes = getCanvasSize();
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(10, sizes.w / sizes.h, 0.1, 100);
        camera.position.set(18, 8, 20);
        scene.add(camera);

        const controls = new OrbitControls(camera, canvas);
        controls.enableRotate = false;
        controls.enableZoom = false;
        controls.enablePan = false;

        const sph = new THREE.Spherical().setFromVector3(
            camera.position.clone().sub(controls.target)
        );

        const VERTICAL_WIGGLE = THREE.MathUtils.degToRad(0.5);
        controls.minPolarAngle = sph.phi - VERTICAL_WIGGLE;
        controls.maxPolarAngle = sph.phi + VERTICAL_WIGGLE;
        controls.minAzimuthAngle = -Math.PI / 80;
        controls.maxAzimuthAngle = Math.PI / 2.5;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(sizes.w, sizes.h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;

        const loader = new GLTFLoader();
        const tex = new THREE.TextureLoader();

        const bakedTexture = tex.load(
            'https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room05/' +
            'ae27bdffd31dcc5cd5a919263f8f1c6874e05400/baked.jpg'
        );
        bakedTexture.flipY = false;
        bakedTexture.encoding = THREE.sRGBEncoding;

        const bakedMat = new THREE.MeshBasicMaterial({
            map: bakedTexture,
            side: THREE.DoubleSide,
        });

        loader.load(
            'https://rawcdn.githack.com/ricardoolivaalonso/ThreeJS-Room05/' +
            'ae27bdffd31dcc5cd5a919263f8f1c6874e05400/model.glb',
            (gltf) => {
                gltf.scene.traverse((c) => (c.material = bakedMat));
                scene.add(gltf.scene);
            }
        );

        // Hover-based interaction
        let isMouseOver = false;
        let mouseX = 0.5; // Normalized (0 to 1)
        let mouseY = 0.5;

        canvas.addEventListener('mouseenter', () => {
            isMouseOver = true;
        });

        canvas.addEventListener('mouseleave', () => {
            isMouseOver = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width; // 0 (left) to 1 (right)
            mouseY = (e.clientY - rect.top) / rect.height; // 0 (top) to 1 (bottom)
        });

        const onResize = () => {
            sizes = getCanvasSize();
            camera.aspect = sizes.w / sizes.h;
            camera.updateProjectionMatrix();
            renderer.setSize(sizes.w, sizes.h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(onResize, 100);
        };
        window.addEventListener('resize', handleResize);

        const tick = () => {
            if (isMouseOver) {
                // Interpolate angles based on mouse position
                sph.theta = THREE.MathUtils.lerp(
                    controls.minAzimuthAngle,
                    controls.maxAzimuthAngle,
                    mouseX
                );
                sph.phi = THREE.MathUtils.lerp(
                    controls.minPolarAngle,
                    controls.maxPolarAngle,
                    mouseY
                );

                camera.position
                    .copy(controls.target)
                    .add(new THREE.Vector3().setFromSpherical(sph));
                camera.lookAt(controls.target);
            }

            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };
        tick();

        return () => {
            canvas.removeEventListener('mouseenter', () => { });
            canvas.removeEventListener('mouseleave', () => { });
            canvas.removeEventListener('mousemove', () => { });
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            renderer.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} className="webgl" />;
}

export default ThreeCanvas;
