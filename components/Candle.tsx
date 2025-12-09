import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils, Mesh } from 'three';
import { useSpring, animated } from '@react-spring/three';
import Flame from './Flame';
import { AppState, CandleData } from '../types';

interface CandleProps {
  data: CandleData;
  appState: AppState;
}

const Candle: React.FC<CandleProps> = ({ data, appState }) => {
  const groupRef = useRef<Group>(null);
  const smokeRef = useRef<Group>(null);
  
  // Dual Position System Logic
  const isBlowing = appState === AppState.BLOWING || appState === AppState.FINISHED;

  const { position, rotation } = useSpring({
    position: isBlowing 
      ? [data.position[0] * 1.05, data.position[1], data.position[2] * 1.05] as [number, number, number] // Move slightly out
      : data.position,
    rotation: isBlowing
      ? [
          data.rotation[0] + (Math.random() * 0.2), // Random tilt away
          data.rotation[1],
          data.rotation[2] + (Math.random() * 0.2)
        ] as [number, number, number]
      : data.rotation,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  // Smoke Particles
  // Enhanced for visibility and "3D interaction" feel
  const smokeParticles = useMemo(() => {
    return new Array(12).fill(0).map(() => ({
      offset: new Vector3((Math.random() - 0.5) * 0.1, Math.random() * 0.2, (Math.random() - 0.5) * 0.1),
      speed: 0.02 + Math.random() * 0.03,
      ref: React.createRef<Mesh>(),
      active: false,
    }));
  }, []);

  useFrame((state, delta) => {
    // Animate Smoke
    if (isBlowing && smokeRef.current) {
        smokeRef.current.visible = true;
        smokeParticles.forEach((p, i) => {
            const mesh = p.ref.current;
            if (mesh) {
                // If the candle just blew out or cycle repeats
                if (mesh.position.y > 2.5 || (mesh.material as any).opacity <= 0.01) {
                     mesh.position.set(p.offset.x, 0.6 + p.offset.y, p.offset.z); // Reset to wick area
                     (mesh.material as any).opacity = 0.5 + Math.random() * 0.3;
                     mesh.scale.setScalar(0.05); // Start small
                }
                
                // Rise up
                mesh.position.y += p.speed * 25 * delta;
                
                // Drift with "wind"
                mesh.position.x += Math.sin(state.clock.elapsedTime * 3 + i) * 0.01;
                mesh.position.z += Math.cos(state.clock.elapsedTime * 2 + i) * 0.01;
                
                // Fade out
                (mesh.material as any).opacity = MathUtils.lerp((mesh.material as any).opacity, 0, delta * 1.0);
                
                // Expand
                const targetScale = 0.2;
                const currentScale = mesh.scale.x;
                const newScale = MathUtils.lerp(currentScale, targetScale, delta * 0.8);
                mesh.scale.setScalar(newScale);
            }
        });
    } else if (smokeRef.current) {
        smokeRef.current.visible = false;
    }
  });

  return (
    <animated.group ref={groupRef} position={position as any} rotation={rotation as any}>
      {/* Wax Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 16]} />
        <meshStandardMaterial color={data.color} roughness={0.3} />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Flame - Controlled by State */}
      <group visible={!isBlowing}>
         <Flame intensity={isBlowing ? 0 : 1} />
      </group>

      {/* Point Light for the flame glow - animated out when blowing */}
      {!isBlowing && (
        <pointLight
          position={[0, 0.8, 0]}
          intensity={1.5}
          color="#FFD700"
          distance={3}
          decay={2}
        />
      )}

      {/* Smoke Group */}
      <group ref={smokeRef} visible={false}>
          {smokeParticles.map((p, i) => (
              <mesh key={i} ref={p.ref} position={[p.offset.x, 0.6 + p.offset.y, p.offset.z]} scale={[0.05, 0.05, 0.05]}>
                  <sphereGeometry args={[1, 8, 8]} />
                  <meshBasicMaterial color="#dcdcdc" transparent opacity={0} depthWrite={false} />
              </mesh>
          ))}
      </group>
    </animated.group>
  );
};

export default Candle;