import { useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

function RocketModel({ cgPos, cpPos }: { cgPos: number, cpPos: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const isStable = cpPos > cgPos;

  useFrame((state) => {
    if (groupRef.current) {
      if (!isStable) {
        // Unstable: Tumble
        groupRef.current.rotation.z += 0.05;
        groupRef.current.rotation.x += 0.02;
      } else {
        // Stable: Slight wobble but generally points up
        // Smoothly return to upright if it was tumbling
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, Math.sin(state.clock.elapsedTime * 2) * 0.1, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.cos(state.clock.elapsedTime * 2) * 0.1, 0.1);
      }
    }
  });

  // Convert percentage (0-100) to local Y position (-2 to 2)
  // 0% is top (Y=2), 100% is bottom (Y=-2)
  const cgY = 2 - (cgPos / 100) * 4;
  const cpY = 2 - (cpPos / 100) * 4;

  return (
    <group ref={groupRef}>
      {/* Rocket Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 4, 32]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Nose Cone */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.4, 1, 32]} />
        <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Fins */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[1.5, 1, 0.05]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, -1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.5, 1, 0.05]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* CG Marker */}
      <mesh position={[0, cgY, 0.5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0.4, cgY, 0.5]} fontSize={0.3} color="#eab308" anchorX="left">
        CG
      </Text>

      {/* CP Marker */}
      <mesh position={[0, cpY, 0.5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0.4, cpY, 0.5]} fontSize={0.3} color="#ef4444" anchorX="left">
        CP
      </Text>
    </group>
  );
}

export default function CgCpInteractive() {
  const [cgPos, setCgPos] = useState([40]); // Center of Gravity (from top)
  const [cpPos, setCpPos] = useState([60]); // Center of Pressure (from top)

  const isStable = cpPos[0] > cgPos[0];

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-slate-800 bg-[#0b101a]">
      <CardHeader>
        <CardTitle className="text-white">气动稳定性：重心(CG)与压力中心(CP)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-80 bg-slate-900 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="city" />
            <RocketModel cgPos={cgPos[0]} cpPos={cpPos[0]} />
            <OrbitControls enableZoom={false} />
          </Canvas>

          {/* Stability Indicator */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <div className={`px-4 py-2 rounded-full font-bold text-white shadow-lg ${isStable ? 'bg-green-500/80' : 'bg-red-500/80 animate-pulse'}`}>
              {isStable ? '稳定飞行 (Stable)' : '失控翻滚 (Unstable)'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-yellow-500">重心 (CG) 位置: {cgPos[0]}%</label>
            </div>
            <Slider 
              value={cgPos} 
              onValueChange={(val) => setCgPos(val as number[])} 
              max={100} 
              step={1} 
              className="w-full"
            />
            <p className="text-xs text-slate-400">通过改变火箭内部载荷分布来调整重心。</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-red-500">压力中心 (CP) 位置: {cpPos[0]}%</label>
            </div>
            <Slider 
              value={cpPos} 
              onValueChange={(val) => setCpPos(val as number[])} 
              max={100} 
              step={1} 
              className="w-full"
            />
            <p className="text-xs text-slate-400">通过改变尾翼大小和形状来调整压力中心。</p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 text-sm text-slate-300">
            <strong>原理：</strong> 气动力作用在CP上。如果CP在CG前方，气动力会产生一个让火箭偏离航向的力矩，导致翻滚。如果CP在CG后方，气动力会产生恢复力矩，使火箭像飞镖一样保持稳定。
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
