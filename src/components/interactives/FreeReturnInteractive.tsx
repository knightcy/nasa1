import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';

function TrajectorySystem() {
  const scRef = useRef<THREE.Mesh>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.4) % (Math.PI * 2);
    
    // Earth rotation
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.01;
    }
    
    // Moon rotation
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.005;
    }

    // Spacecraft figure-8 motion
    if (scRef.current) {
      // Parametric equation for a figure-8 (Lemniscate of Gerono or similar)
      // Adjusted to go around Earth (-3, 0, 0) and Moon (3, 0, 0)
      const scale = 3.5;
      const x = scale * Math.sin(t);
      const z = scale * Math.sin(t) * Math.cos(t);
      
      scRef.current.position.set(x, 0, z);
    }
  });

  return (
    <group>
      {/* Earth */}
      <Sphere ref={earthRef} args={[0.8, 32, 32]} position={[-3, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" roughness={0.6} />
      </Sphere>

      {/* Moon */}
      <Sphere ref={moonRef} args={[0.3, 32, 32]} position={[3, 0, 0]}>
        <meshStandardMaterial color="#9ca3af" roughness={0.8} />
      </Sphere>

      {/* Spacecraft */}
      <Trail width={0.2} length={50} color={new THREE.Color('#fef08a')} attenuation={(t) => t * t}>
        <Sphere ref={scRef} args={[0.08, 16, 16]}>
          <meshBasicMaterial color="#fef08a" />
        </Sphere>
      </Trail>
    </group>
  );
}

export default function FreeReturnInteractive() {
  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-slate-800 bg-[#0b101a]">
      <CardHeader>
        <CardTitle className="text-white">地月转移：自由返回轨道 (Free-Return Trajectory)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-80 bg-slate-900 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 8, 0], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <TrajectorySystem />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          <div className="absolute top-2 right-2 text-xs text-slate-400 pointer-events-none bg-slate-900/80 p-1 rounded">
            拖动旋转视角
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 text-sm text-slate-300">
          <strong>原理解析：</strong> 
          自由返回轨道是一种特殊的绕月轨道设计。如果飞船的发动机在月球附近发生故障（如著名的阿波罗13号），飞船可以利用月球的引力弹弓效应，自动沿着“8字型”轨迹被甩回地球。
          <br/><br/>
          <strong>容错机制：</strong> 
          这种轨道设计提供了一个关键的被动安全机制。它不需要飞船在月球附近进行任何变轨机动，只要初始轨道计算精确，飞船就会自然而然地返回地球大气层的再入走廊。
        </div>
      </CardContent>
    </Card>
  );
}
