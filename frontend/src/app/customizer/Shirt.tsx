"use client";

import { Text, useGLTF } from "@react-three/drei";
import { fabricMaterials } from "./materials";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { DesignLayer, GarmentPart, PrintTarget } from "./Studio";

interface ShirtProps {
  color: string;
  modelPath: string;
  panelColors: Record<GarmentPart, string>;
  material: string;
  layers: DesignLayer[];
}

export default function Shirt({
  color,
  modelPath,
  panelColors,
  material,
  layers,
}: ShirtProps) {
  const shirt = useGLTF(modelPath);
  const materialSettings = fabricMaterials[material];
  const logoTextures = useMemo(
    () =>
      Object.fromEntries(
        layers
          .filter((layer) => layer.type === "logo")
          .map((layer) => [
            layer.id,
            new THREE.TextureLoader().load(layer.content),
          ]),
      ),
    [layers],
  );
  const scene = useMemo(() => shirt.scene.clone(true), [shirt.scene]);
  const partNameFor = (object: THREE.Object3D) => {
    const names: string[] = [];
    let current: THREE.Object3D | null = object;
    while (current) {
      names.push(current.name);
      current = current.parent;
    }
    return names
      .join(" ")
      .toLowerCase()
      .replace(/[\s_-]/g, "");
  };
  const previewTransform = useMemo(() => {
    scene.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    // GLB files can be authored at very different sizes and origins. Normalising
    // them here keeps the complete garment centred in the customizer preview.
    const scale = 4.8 / Math.max(size.y, 0.01);

    return {
      scale,
      position: [-center.x * scale, -center.y * scale, -center.z * scale] as [
        number,
        number,
        number,
      ],
      center,
      size,
      frontZ: bounds.max.z,
      backZ: bounds.min.z,
    };
  }, [scene]);
  const partBounds = useMemo(() => {
    const bounds: Partial<Record<PrintTarget, THREE.Box3>> = {};
    const targetForName = (name: string): PrintTarget | null => {
      const normalized = name.toLowerCase().replace(/[\s_-]/g, "");
      if (normalized.includes("frontbody")) return "front";
      if (normalized.includes("backbody")) return "back";
      if (normalized.includes("leftsleeve")) return "left-sleeve";
      if (normalized.includes("rightsleeve")) return "right-sleeve";
      return null;
    };
    scene.updateWorldMatrix(true, true);
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const target = targetForName(partNameFor(child));
      if (!target) return;
      const meshBounds = new THREE.Box3().setFromObject(child);
      if (bounds[target]) bounds[target]!.union(meshBounds);
      else bounds[target] = meshBounds;
    });
    return bounds;
  }, [scene]);
  const fontFiles: Record<string, string> = {
    Anton: "/fonts/Anton.ttf",
    BebasNeue: "/fonts/BebasNeue.ttf",
    Cinzel: "/fonts/Cinzel.ttf",
    "Inter-Italic": "/fonts/Inter-Italic.ttf",
    Inter: "/fonts/Inter.ttf",
    "Montserrat-Italic": "/fonts/Montserrat-Italic.ttf",
    Montserrat: "/fonts/Montserrat.ttf",
    Oswald: "/fonts/Oswald.ttf",
    Pacifico: "/fonts/Pacifico.ttf",
  };

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const partName = partNameFor(child);
        const partColor = partName.includes("leftsleeve")
          ? panelColors["left-sleeve"]
          : partName.includes("rightsleeve")
            ? panelColors["right-sleeve"]
            : partName.includes("collar")
              ? panelColors.collar
              : partName.includes("frontbody")
                ? panelColors.front
                : partName.includes("backbody")
                  ? panelColors.back
                  : color;
        if (!child.userData.studioMaterials) {
          child.material = Array.isArray(child.material)
            ? child.material.map((item) => item.clone())
            : child.material.clone();
          child.userData.studioMaterials = true;
        }
        const meshMaterials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        meshMaterials.forEach((meshMaterial) => {
          if (!(meshMaterial instanceof THREE.MeshStandardMaterial)) return;
          // BlenderKit garments can include texture, baked-light and vertex
          // colour data. Those assets multiply the selected swatch and make
          // light colours appear dark or patchy, so the customizer uses a
          // clean fabric surface instead.
          meshMaterial.map = null;
          meshMaterial.aoMap = null;
          meshMaterial.lightMap = null;
          meshMaterial.emissiveMap = null;
          meshMaterial.normalMap = null;
          meshMaterial.bumpMap = null;
          meshMaterial.displacementMap = null;
          meshMaterial.roughnessMap = null;
          meshMaterial.metalnessMap = null;
          meshMaterial.alphaMap = null;
          meshMaterial.vertexColors = false;
          meshMaterial.emissive.set(0x000000);
          meshMaterial.emissiveIntensity = 0;
          meshMaterial.transparent = false;
          meshMaterial.opacity = 1;
          meshMaterial.alphaTest = 0;
          meshMaterial.depthWrite = true;
          meshMaterial.side = THREE.FrontSide;
          // Some Blender exports use MeshPhysicalMaterial transmission. It
          // survives the normal opacity settings and makes the garment look
          // like thin glass, exposing the inside of the mesh.
          if (meshMaterial instanceof THREE.MeshPhysicalMaterial) {
            meshMaterial.transmission = 0;
            meshMaterial.thickness = 0;
            meshMaterial.ior = 1.45;
            meshMaterial.clearcoat = 0;
          }
          meshMaterial.color.set(partColor);
          meshMaterial.roughness = materialSettings.roughness;
          meshMaterial.metalness = materialSettings.metalness;
          meshMaterial.envMapIntensity = materialSettings.envMapIntensity;
          meshMaterial.needsUpdate = true;
        });
      }
    });
  }, [scene, color, materialSettings, modelPath, panelColors]);

  const surfaceFor = (target: PrintTarget) => {
    const isBack = target === "back";
    const sleeve = target === "left-sleeve" || target === "right-sleeve";
    const bounds =
      partBounds[target] ??
      new THREE.Box3().setFromCenterAndSize(garmentCenter, garmentSize);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const sleeveDirection = target === "left-sleeve" ? 1 : -1;
    return {
      // Each print is positioned from the bounding box of the actual exported
      // part, not from an estimated whole-shirt region.
      z: sleeve
        ? center.z
        : isBack
          ? bounds.min.z - 0.009
          : bounds.max.z + 0.009,
      rotation: [
        0,
        sleeve ? (sleeveDirection * Math.PI) / 2 : isBack ? Math.PI : 0,
        0,
      ] as [number, number, number],
      centerX: sleeve
        ? sleeveDirection > 0
          ? bounds.max.x + 0.009
          : bounds.min.x - 0.009
        : center.x,
      horizontalSpan: sleeve ? Math.max(size.z * 1.2, 0.04) : size.x * 1.15,
      verticalSpan: size.y * 1.45,
      baseY: center.y,
      sleeve,
    };
  };
  const garmentCenter = previewTransform.center;
  const garmentSize = previewTransform.size;
  const getPrintPosition = (
    target: PrintTarget,
    position: [number, number],
  ): [number, number, number] => {
    const surface = surfaceFor(target);
    return [
      surface.centerX + position[0] * surface.horizontalSpan,
      surface.baseY + (position[1] - 0.35) * surface.verticalSpan,
      surface.z,
    ];
  };
  const layerPosition = (layer: DesignLayer) =>
    getPrintPosition(layer.target, layer.position);
  const layerSize = (layer: DesignLayer) =>
    (layer.target === "left-sleeve" || layer.target === "right-sleeve"
      ? garmentSize.x * 0.12
      : garmentSize.x * 0.28) * layer.scale;

  return (
    <group scale={previewTransform.scale} position={previewTransform.position}>
      <primitive object={scene} />
      {layers.map((layer) =>
        layer.type === "logo" ? (
          <mesh
            key={layer.id}
            renderOrder={2}
            position={layerPosition(layer)}
            rotation={[
              surfaceFor(layer.target).rotation[0],
              surfaceFor(layer.target).rotation[1],
              0,
            ]}
          >
            <planeGeometry args={[layerSize(layer), layerSize(layer)]} />
            <meshStandardMaterial
              map={logoTextures[layer.id]}
              transparent
              side={THREE.FrontSide}
              roughness={0.9}
              depthTest={false}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        ) : (
          <Text
            key={layer.id}
            renderOrder={2}
            material-depthTest={false}
            material-depthWrite={false}
            position={layerPosition(layer)}
            rotation={[
              surfaceFor(layer.target).rotation[0],
              surfaceFor(layer.target).rotation[1],
              0,
            ]}
            font={fontFiles[layer.font]}
            fontSize={layer.scale * (garmentSize.x / 1.35)}
            color={layer.color}
            anchorX="center"
            anchorY="middle"
            maxWidth={
              layer.target === "left-sleeve" || layer.target === "right-sleeve"
                ? garmentSize.x * 0.16
                : garmentSize.x * 0.5
            }
            textAlign="center"
          >
            {layer.content}
          </Text>
        ),
      )}
    </group>
  );
}
