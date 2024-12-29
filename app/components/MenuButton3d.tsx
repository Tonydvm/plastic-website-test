import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export function MenuButton3D({ modelPath }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.position.set(0, 0, 5);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 8, 10);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    let model;
    let mouseX = 0;
    let mouseY = 0;
    let animatingToMouse = false;
    let isMouseInside = false; 

    const hdrLoader = new RGBELoader();
    hdrLoader.load(
      "assets/empty_warehouse_01_4k.hdr", // Ensure this path is correct
      (hdrEquirect) => {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrEquirect; // Set the scene's environment

        // Load the 3D model
        const loader = new GLTFLoader();
        loader.load(
          modelPath,
          (gltf) => {
            model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            model.position.sub(center);
            const maxAxis = Math.max(size.x, size.y, size.z);
            model.scale.setScalar(1 / maxAxis + 200); // Keep scaling reasonable

            // Apply material with environment map
            const plasticMaterial = new THREE.MeshPhysicalMaterial({
                metalness: 0, // Non-metallic surface
                roughness: 0.7, // High roughness for diffused reflections
                transmission: 1, // Fully transparent
                thickness: 0.5, // Adds depth and refraction
                ior: 1.4, // Adjust for realistic plastic refraction
                color: 0x11d957, // Green tint
                opacity: 0.9, // High transparency
                transparent: true, // Enables blending
                envMap: hdrEquirect, // Reflection map for lighting
                envMapIntensity: 5, // Increase intensity for stronger reflections
                clearcoat: 0.5, // Subtle clearcoat for sheen
                clearcoatRoughness: 1, // Rough clearcoat for scattered highlights
            });

            model.traverse((child) => {
              if (child.isMesh) {
                child.material = plasticMaterial;
              }
            });

            scene.add(model);
          },
          undefined,
          (error) => {
            console.error("Error loading model:", error);
          }
        );
      },
      undefined,
      (error) => {
        console.error("Error loading HDR environment map:", error);
      }
    );

    // Mouse move effect
    const onMouseMove = (event) => {
      if (!model) return;

      const rect = canvas.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };

    // Mouse enter effect
    const onMouseEnter = () => {
      if (!model) return;
      isMouseInside = true;
    };

    // Mouse leave effect
    const onMouseLeave = () => {
      if (!model) return;

      isMouseInside = false;

      const currentRotation = { x: model.rotation.x, y: model.rotation.y };
      const targetRotation = { x: 0, y: 0 };

      const duration = 0.5; 
      const start = performance.now();

      const animateLeave = (timestamp) => {
        const elapsed = (timestamp - start) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        model.rotation.x = THREE.MathUtils.lerp(currentRotation.x, targetRotation.x, progress);
        model.rotation.y = THREE.MathUtils.lerp(currentRotation.y, targetRotation.y, progress);

        if (progress < 1) {
          requestAnimationFrame(animateLeave);
        }
      };

      requestAnimationFrame(animateLeave);
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseenter", onMouseEnter);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // Animate the scene
    const animate = () => {
      requestAnimationFrame(animate);

      if (isMouseInside && !animatingToMouse && model) {
        model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, mouseY * 0.2, 0.1);
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, mouseX * 0.2, 0.1);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle cleanup and resizing
    const handleResize = () => {
        const width = canvas.clientWidth; // Updated width
        const height = canvas.clientHeight; // Updated height
        renderer.setSize(width, height);
        camera.aspect = width / height; // Adjust aspect ratio
        camera.updateProjectionMatrix(); // Update the camera matrix
      };
      
      // Call handleResize immediately to set correct aspect ratio for new dimensions
      handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseenter", onMouseEnter);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [modelPath]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "200px", height: "150px" }} // Wider canvas dimensions
    />
  );
}

export default MenuButton3D;
