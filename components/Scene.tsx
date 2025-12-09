import React, { useRef, useLayoutEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Cake from './Cake';
import Candle from './Candle';
import { AppState, CandleData } from '../types';
import { CONFIG, COLORS } from '../constants';

interface SceneProps {
  appState: AppState;
}

const Scene: React.FC<SceneProps> = ({ appState }) => {
  const { width, height } = useThree((state) => state.size);
  const isPortrait = width < height;

  // Responsive Camera Position
  // Move camera further back and higher on mobile (portrait) to fit the cake
  const cameraPosition: [number, number, number] = isPortrait 
    ? [0, 8, 16] 
    : [0, 4, 8];

  const cameraFov = isPortrait ? 50 : 45;

  // Generate candle data once
  const candles: CandleData[] = React.useMemo(() => {
    const items: CandleData[] = [];
    const radius = CONFIG.candleRadius;
    const count = CONFIG.candleCount;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      items.push({
        id: i,
        position: [x, 2.8, z], // On top of cake (cake height is roughly 2.3 + 0.5 candle offset)
        rotation: [0, 0, 0],
        color: COLORS.candleWax[i % COLORS.candleWax.length],
      });
    }
    return items;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
      if (groupRef.current) {
          // Subtle idle rotation for the whole cake
          groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      }
  });

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={cameraPosition} 
        fov={cameraFov} 
      />
      
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.2} 
        minDistance={isPortrait ? 8 : 5}
        maxDistance={isPortrait ? 20 : 12}
      />

      {/* Environment & Lighting */}
      <ambientLight intensity={0.4} color="#FFEEEE" />
      <spotLight 
        position={[10, 10, 5]} 
        angle={0.3} 
        penumbra={1} 
        intensity={0.8} 
        castShadow 
        shadow-bias={-0.0001}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffd1dc" />

      {/* Post Processing for the "Warm Glow" */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
            color={new THREE.Color('#FFD700')}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.4} />
      </EffectComposer>

      {/* Main Content Group */}
      <group ref={groupRef}>
        <Cake />
        {candles.map((candle) => (
          <Candle key={candle.id} data={candle} appState={appState} />
        ))}
      </group>

      <ContactShadows opacity={0.4} scale={10} blur={2} far={4} />
    </>
  );
};

export default Scene;