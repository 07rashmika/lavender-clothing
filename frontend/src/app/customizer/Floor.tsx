export default function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <shadowMaterial opacity={0.25} />
    </mesh>
  );
}
