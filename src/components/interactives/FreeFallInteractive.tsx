import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function Simulation({ velocity, isPlaying }: { velocity: number, isPlaying: boolean }) {
  const objectRef = useRef<THREE.Mesh>(null);
  const earthRadius = 3;
  const orbitRadius = 4;
  
  // Reset position when not playing
  useEffect(() => {
    if (!isPlaying && objectRef.current) {
      objectRef.current.position.set(0, orbitRadius, 0);
    }
  }, [isPlaying]);

  useFrame((state, delta) => {
    if (isPlaying && objectRef.current) {
      const pos = objectRef.current.position;
      
      if (velocity === 0) {
        // Drop
        if (pos.y > earthRadius + 0.1) {
          pos.y -= 2 * delta;
        }
      } else if (velocity === 1) {
        // Throw
        if (pos.y > earthRadius + 0.1) {
          pos.x += 2 * delta;
          pos.y -= 2 * delta;
        }
      } else if (velocity === 2) {
        // Orbit
        const time = state.clock.elapsedTime;
        pos.x = Math.sin(time) * orbitRadius;
        pos.y = Math.cos(time) * orbitRadius;
      }
    }
  });

  return (
    <group>
      {/* Earth */}
      <Sphere args={[earthRadius, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" roughness={0.8} metalness={0.2} />
      </Sphere>

      {/* Object */}
      <Sphere ref={objectRef} args={[0.1, 16, 16]} position={[0, orbitRadius, 0]}>
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
      </Sphere>

      {/* Orbit Path */}
      {velocity === 2 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export default function FreeFallInteractive() {
  const [velocity, setVelocity] = useState(0); // 0: drop, 1: slow throw, 2: orbit speed
  const [isPlaying, setIsPlaying] = useState(false);

  const startSimulation = (v: number) => {
    setIsPlaying(false);
    setVelocity(v);
    setTimeout(() => setIsPlaying(true), 100);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-slate-800 bg-[#0b101a]">
      <CardHeader>
        <CardTitle className="text-white">坠落的艺术：微重力的本质</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-80 bg-slate-900 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Simulation velocity={velocity} isPlaying={isPlaying} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Button onClick={() => startSimulation(0)} variant={velocity === 0 ? "default" : "outline"} className="bg-slate-800 text-white hover:bg-slate-700">
            垂直释放 (自由落体)
          </Button>
          <Button onClick={() => startSimulation(1)} variant={velocity === 1 ? "default" : "outline"} className="bg-slate-800 text-white hover:bg-slate-700">
            水平抛掷 (抛物线)
          </Button>
          <Button onClick={() => startSimulation(2)} variant={velocity === 2 ? "default" : "outline"} className="bg-slate-800 text-white hover:bg-slate-700">
            第一宇宙速度 (入轨)
          </Button>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 text-sm text-slate-300">
          <strong>原理解析：</strong> 
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>垂直释放：</strong> 物体在重力作用下直线加速下落。</li>
            <li><strong>水平抛掷：</strong> 物体同时具有水平速度和向下的重力加速度，形成抛物线轨迹。</li>
            <li><strong>入轨速度 (约7.9 km/s)：</strong> 当水平速度足够大时，物体下落的弧度刚好与地球表面的曲率一致。它在不断“坠落”，但永远落不到地面，这就是国际空间站处于“失重”状态的原因。</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
