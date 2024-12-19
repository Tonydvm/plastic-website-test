import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export function Welcome() {
  const canvasRef = useRef(null);

  // npm run dev

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0, 2, 5); // Set a better starting position for viewing the model

    // Add directional light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Add ambient light for softer lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load(
      "assets/unti111tled.gltf", // Update this with the path to your .glb file
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(10, 10, 10); // Adjust the scale (x, y, z)
        model.position.set(0, 0, 0); // Adjust model position if needed
        scene.add(model);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error happened while loading the model:", error);
      }
    );

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add smooth damping effect
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2; // Minimum zoom distance
    controls.maxDistance = 50; // Maximum zoom distance
    controls.target.set(0, 1, 0); // Focus the controls on the model's position

    // Animate function
    function animate() {
      requestAnimationFrame(animate);
      controls.update(); // Update OrbitControls
      renderer.render(scene, camera);
    }

    animate();

    // Handle resizing
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose(); // Clean up OrbitControls
    };
  }, []);

  return (
    <main className="flex items-center justify-center">
      <canvas ref={canvasRef} />
    </main>
  );
}
