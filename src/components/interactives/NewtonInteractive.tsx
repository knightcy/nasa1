import { useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';

function Rocket({ force }: { force: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Move rocket based on force
      groupRef.current.position.x = -5 + (force / 100) * 10;
      
      // Animate exhaust
      if (exhaustRef.current) {
        exhaustRef.current.scale.y = 1 + Math.random() * (force / 50);
        // @ts-ignore
        exhaustRef.current.material.opacity = 0.5 + (force / 200);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Rocket Body */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* Nose Cone */}
      <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Fins */}
      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={[0.4, 1.5, 0.1]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[-0.8, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.4, 1.5, 0.1]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Exhaust */}
      <Trail width={2} length={force} color={new THREE.Color('#f97316')} attenuation={(t) => t * t}>
        <mesh ref={exhaustRef} position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.3 + force / 200, 1 + force / 50, 16]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
        </mesh>
      </Trail>
    </group>
  );
}

export default function NewtonInteractive() {
  const [force, setForce] = useState([50]);

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-[var(--nasa-bg-hover)] bg-[var(--nasa-bg-secondary)]">
      <CardHeader>
        <CardTitle className="text-[var(--nasa-text)]">牛顿第三定律演示：火箭推进</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-64 bg-[var(--nasa-bg-tertiary)] rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Rocket force={force[0]} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          
          {/* Force Vectors Overlay */}
          <div className="absolute bottom-4 left-0 w-full px-8 flex justify-between text-sm font-medium z-10 pointer-events-none">
            <div className="flex flex-col items-center" style={{ width: '50%' }}>
              <span className="text-orange-500 mb-1 drop-shadow-md">作用力 (气体向左喷出)</span>
              <div 
                className="h-1 bg-orange-500 transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.8)]" 
                style={{ width: `${force[0]}%` }}
              />
            </div>
            <div className="flex flex-col items-center" style={{ width: '50%' }}>
              <span className="text-blue-400 mb-1 drop-shadow-md">反作用力 (推火箭向右)</span>
              <div 
                className="h-1 bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                style={{ width: `${force[0]}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-[var(--nasa-text)]">
            <label className="font-medium">喷射气体力大小: {force[0]} N</label>
          </div>
          <Slider 
            value={force} 
            onValueChange={(val) => setForce(val as number[])} 
            max={100} 
            step={1} 
            className="w-full"
          />
          <p className="text-sm text-[var(--nasa-text-secondary)] text-center mt-4">
            拖动滑块改变气体喷出的力。根据牛顿第三定律，气体向后喷出的作用力越大，火箭获得向前的反作用力也越大。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
