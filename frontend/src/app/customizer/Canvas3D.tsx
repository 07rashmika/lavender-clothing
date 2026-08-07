"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Shirt from "./Shirt";
import Floor from "./Floor";
import type { DesignLayer, GarmentPart } from "./Studio";

interface Canvas3DProps {
  color: string;
  height?: string;
  modelPath: string;
  panelColors: Record<GarmentPart, string>;
  material: string;
  layers?: DesignLayer[];
  // Legacy props remain optional because the original customizer page is
  // retained below an unreachable feature flag during migration.
  logo?: string | null;
  customText?: string;
  font?: string;
  textColor?: string;
  textSize?: number;
  textPosition?: [number, number];
  textTarget?: import("./Studio").PrintTarget;
  textRotation?: number;
  letterspacing?: number;
  side?: "front" | "back";
  artworkPosition?: [number, number];
  artworkTarget?: import("./Studio").PrintTarget;
  artworkScale?: number;
  logoRotation?: number;
  isDraggingLogo?: boolean;
  setIsDraggingLogo?: React.Dispatch<React.SetStateAction<boolean>>;
  setArtworkPosition?: React.Dispatch<React.SetStateAction<[number, number]>>;
  setRenderer?: (renderer: THREE.WebGLRenderer) => void;
  resetToken: number;
}

function CameraController({
  resetToken,
  modelPath,
}: Pick<Canvas3DProps, "resetToken" | "modelPath">) {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    camera.position.set(0, 0, 6.8);
    camera.lookAt(0, 0, 0);
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
  }, [camera, resetToken, modelPath]);

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={6.2}
      maxDistance={10}
      // Keep the view on the garment's product-rotation plane. The imported
      // model exposes disconnected geometry when viewed from steep angles.
      maxPolarAngle={Math.PI / 2 + 0.18}
      minPolarAngle={Math.PI / 2 - 0.18}
    />
  );
}

function RendererSetter({
  setRenderer,
}: {
  setRenderer?: (renderer: THREE.WebGLRenderer) => void;
}) {
  const { gl } = useThree();

  useEffect(() => {
    setRenderer?.(gl);
  }, [gl, setRenderer]);

  return null;
}

export default function Canvas3D({
  color,
  height = "clamp(760px, 92vh, 900px)",
  modelPath,
  panelColors,
  material,
  layers,
  logo,
  customText,
  font,
  textColor,
  textSize,
  textPosition,
  textTarget,
  artworkPosition,
  artworkTarget,
  artworkScale,
  setRenderer,
  resetToken,
}: Canvas3DProps) {
  const previewLayers = layers ?? [
    ...(logo
      ? [
          {
            id: "legacy-logo",
            type: "logo" as const,
            content: logo,
            target: artworkTarget ?? "front",
            position: artworkPosition ?? ([0, 0.35] as [number, number]),
            scale: artworkScale ?? 1,
            color: "#171717",
            font: "Anton",
          },
        ]
      : []),
    ...(customText
      ? [
          {
            id: "legacy-text",
            type: "text" as const,
            content: customText,
            target: textTarget ?? "front",
            position: textPosition ?? ([0, 0.35] as [number, number]),
            scale: textSize ?? 0.11,
            color: textColor ?? "#171717",
            font: font ?? "Anton",
          },
        ]
      : []),
  ];
  return (
    <Canvas
      style={{ width: "100%", height }}
      shadows
      gl={{ preserveDrawingBuffer: true }}
      camera={{
        position: [0, 0, 6.8],
        fov: 45,
      }}
    >
      <ambientLight intensity={0.72} />
      <hemisphereLight args={["#ffffff", "#dfe6f2", 0.55]} />

      <directionalLight position={[5, 5, 5]} intensity={1.65} castShadow />
      <directionalLight position={[-4, 2, 3]} intensity={0.5} />

      <Suspense fallback={null}>
        <Shirt
          color={color}
          modelPath={modelPath}
          panelColors={panelColors}
          material={material}
          layers={previewLayers}
        />
        <Floor />
      </Suspense>

      <CameraController resetToken={resetToken} modelPath={modelPath} />
      <RendererSetter setRenderer={setRenderer} />
    </Canvas>
  );
}
