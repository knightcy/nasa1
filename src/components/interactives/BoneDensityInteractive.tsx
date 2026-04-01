import { useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function BoneModel({ densityLoss }: { densityLoss: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate material properties based on density loss
  // As density decreases, the bone becomes more porous (represented by wireframe or opacity)
  const opacity = Math.max(0.3, 1 - (densityLoss / 100) * 1.5);
  const wireframe = densityLoss > 15;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group>
      {/* Outer Cortical Bone */}
      <mesh ref={meshRef}>
        <capsuleGeometry args={[1, 3, 16, 32]} />
        <meshStandardMaterial 
          color="#f1f5f9" 
          roughness={0.7} 
          transparent 
          opacity={opacity}
          wireframe={wireframe}
        />
      </mesh>
      
      {/* Inner Trabecular Bone (Spongy) - visible when outer becomes transparent/wireframe */}
      <mesh scale={[0.8, 0.9, 0.8]}>
        <capsuleGeometry args={[1, 3, 8, 16]} />
        <meshStandardMaterial 
          color="#cbd5e1" 
          roughness={0.9} 
          wireframe={true}
          transparent
          opacity={Math.max(0.1, 0.8 - (densityLoss / 100) * 2)}
        />
      </mesh>
    </group>
  );
}

export default function BoneDensityInteractive() {
  const [months, setMonths] = useState([0]);

  // Bone density decreases by roughly 1.5% per month in space without exercise
  const densityLoss = months[0] * 1.5; 
  const currentDensity = Math.max(0, 100 - densityLoss);

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-slate-800 bg-[#0b101a]">
      <CardHeader>
        <CardTitle className="text-white">微重力下的骨密度流失</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-80 bg-slate-900 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="city" />
            <BoneModel densityLoss={densityLoss} />
            <OrbitControls enableZoom={false} />
          </Canvas>

          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="bg-slate-900/80 px-4 py-2 rounded-md font-bold text-lg shadow-sm text-slate-200 border border-slate-700">
              骨密度: {currentDensity.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-slate-200">在太空停留时间: {months[0]} 个月</label>
            </div>
            <Slider 
              value={months} 
              onValueChange={(val) => setMonths(val as number[])} 
              max={24} 
              step={1} 
              className="w-full"
            />
            <p className="text-xs text-slate-400">拖动滑块模拟宇航员在微重力环境下的停留时间（假设无阻力锻炼）。</p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 text-sm text-slate-300">
            <strong>生理学机制：</strong> 
            在地球上，骨骼不断承受身体重量（机械应力），这刺激成骨细胞生成新骨。在微重力环境下，这种应力消失，成骨细胞活性降低，而破骨细胞（分解旧骨）继续工作。这导致骨质每月流失约1-1.5%，特别是在承重骨（如骨盆、下肢）中。宇航员必须每天进行约2小时的剧烈阻力锻炼来对抗这种流失。
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
