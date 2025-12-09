import React from 'react';
import { COLORS } from '../constants';

const Cake: React.FC = () => {
  return (
    <group position={[0, -1, 0]}>
      {/* Base Plate */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[4.5, 4.5, 0.2, 64]} />
        <meshStandardMaterial color={COLORS.plate} roughness={0.1} metalness={0.1} />
      </mesh>

      {/* Bottom Tier */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.5, 3.5, 2.5, 64]} />
        <meshStandardMaterial color={COLORS.cakeBase} roughness={0.6} />
      </mesh>

      {/* Frosting / Icing Top */}
      <mesh position={[0, 2.26, 0]} castShadow>
        <cylinderGeometry args={[3.6, 3.6, 0.1, 64]} />
        <meshStandardMaterial color={COLORS.cakeTop} roughness={0.4} />
      </mesh>

      {/* Frosting Drips (Toruses around the rim) */}
      <group position={[0, 2.2, 0]}>
          {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const x = Math.cos(angle) * 3.5;
              const z = Math.sin(angle) * 3.5;
              return (
                  <mesh key={i} position={[x, 0, z]} rotation={[Math.PI / 2, 0, angle]}>
                      <torusGeometry args={[0.2, 0.15, 8, 16, Math.PI]} />
                      <meshStandardMaterial color={COLORS.cakeTop} roughness={0.4} />
                  </mesh>
              )
          })}
      </group>

      {/* Decorative Spheres at base */}
      <group position={[0, -0.1, 0]}>
         {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              const x = Math.cos(angle) * 3.6;
              const z = Math.sin(angle) * 3.6;
              return (
                  <mesh key={i} position={[x, 0.2, z]} castShadow>
                      <sphereGeometry args={[0.15, 16, 16]} />
                      <meshStandardMaterial color={COLORS.cakeFrosting} roughness={0.2} />
                  </mesh>
              )
          })}
      </group>
    </group>
  );
};

export default Cake;
