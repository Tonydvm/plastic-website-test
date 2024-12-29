import React from "react";
import { MenuButton3D } from "app/components/MenuButton3d.tsx"; // Import the MenuButton3D component

export function Welcome() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
      <header
        style={{
          backgroundColor: "white",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
        }}
      >

      </header>
      <nav
        style={{
          display: "flex",
          justifyContent: "leftAlign",
          backgroundColor: "white",
          padding: "1rem",
        }}
      >
        <MenuButton3D modelPath="assets/R2_2.gltf" /> 
        <MenuButton3D modelPath="assets/R2_2.gltf" /> 
        <MenuButton3D modelPath="assets/R2_2.gltf" /> 
      </nav>
      <main
        style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f4f4f4",
          color: "#333",
          height: "calc(100vh - 100px)",
        }}
      >
        <h2>Welcome to the 3D Menu Webpage</h2>
        <p>
          This is a basic static webpage where each menu button is an interactive 3D
          model rendered using Three.js.
        </p>
      </main>
      <footer
        style={{
          backgroundColor: "#333",
          color: "#fff",
          textAlign: "center",
          padding: "10px 0",
          position: "fixed",
          width: "100%",
          bottom: 0,
        }}
      >
        <p>&copy; 2024 3D Menu Example</p>
      </footer>
    </div>
  );
}

export default Welcome;
