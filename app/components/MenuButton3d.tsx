import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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
      light.position.set(5, 10, 7);
      scene.add(light);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
  
      let model;
      let mouseX = 0;
      let mouseY = 0;
      let animatingToMouse = false;
      let isMouseInside = false; 
  
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
          model.scale.setScalar(1 / maxAxis + 200);
  
          const plasticMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x328a52,
            roughness: 0.1,
            transmission: 0.9,
            opacity: 0.9,
            transparent: true,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.4,
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
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
  
      window.addEventListener("resize", handleResize);
  
      return () => {
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseenter", onMouseEnter);
        canvas.removeEventListener("mouseleave", onMouseLeave);
      };
    }, [modelPath]);
  
    return <canvas ref={canvasRef} style={{ width: "150px", height: "150px" }} />;
  }

export default MenuButton3D;
