import { useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

function LightWave({ z }: { z: number }) {
  const lineRef = useRef<THREE.Line>(null);
  
  // Create a sine wave geometry
  const points = [];
  const length = 10;
  const segments = 100;
  
  // Wavelength increases with z
  const wavelength = 0.5 * (1 + z);
  
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * length - length / 2;
    const y = Math.sin((x / wavelength) * Math.PI * 2) * 0.5;
    points.push(new THREE.Vector3(x, y, 0));
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // Color shifts from blue to red to infrared (invisible/dark red)
  // Simplified color mapping based on z
  const color = new THREE.Color();
  if (z < 0.5) {
    color.setHSL(0.6 - z * 0.8, 1, 0.5); // Blue to Green to Yellow
  } else if (z < 1.5) {
    color.setHSL(0.2 - (z - 0.5) * 0.2, 1, 0.5); // Yellow to Red
  } else {
    color.setHSL(0, 1, Math.max(0.1, 0.5 - (z - 1.5) * 0.2)); // Red fading to dark
  }

  useFrame((state) => {
    if (lineRef.current) {
      // Animate the wave moving from right (galaxy) to left (earth)
      const time = state.clock.elapsedTime;
      const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * length - length / 2;
        // Wave moves left (negative x direction)
        const y = Math.sin(((x + time * 2) / wavelength) * Math.PI * 2) * 0.5;
        positions[i * 3 + 1] = y;
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    // @ts-ignore
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  );
}

function UniverseModel({ distance }: { distance: number }) {
  const z = distance * 0.05;
  
  // Galaxy color shifts with z
  const galaxyColor = new THREE.Color();
  if (z < 0.5) {
    galaxyColor.setHSL(0.6 - z * 0.8, 1, 0.5);
  } else if (z < 1.5) {
    galaxyColor.setHSL(0.2 - (z - 0.5) * 0.2, 1, 0.5);
  } else {
    galaxyColor.setHSL(0, 1, Math.max(0.1, 0.5 - (z - 1.5) * 0.2));
  }

  return (
    <group>
      {/* Earth (Observer) */}
      <Sphere args={[0.5, 32, 32]} position={[-5, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" roughness={0.6} />
      </Sphere>
      
      {/* Distant Galaxy */}
      <Sphere args={[0.8, 32, 32]} position={[5, 0, 0]}>
        <meshStandardMaterial color={galaxyColor} emissive={galaxyColor} emissiveIntensity={0.5} roughness={0.2} />
      </Sphere>

      {/* Light Wave connecting them */}
      <LightWave z={z} />
    </group>
  );
}

export default function RedshiftInteractive() {
  const [distance, setDistance] = useState([0]);
  const z = distance[0] * 0.05; 

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-slate-800 bg-[#0b101a]">
      <CardHeader>
        <CardTitle className="text-white">透视时间：宇宙膨胀与红移</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-80 bg-slate-900 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <UniverseModel distance={distance[0]} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          <div className="absolute top-2 right-2 text-xs text-slate-400 pointer-events-none bg-slate-900/80 p-1 rounded">
            拖动旋转视角
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-blue-400 font-bold pointer-events-none">
            观测者 (地球)
          </div>
          <div className="absolute bottom-4 right-4 text-xs text-red-400 font-bold pointer-events-none">
            遥远星系
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-slate-200">星系相对距离: {distance[0]} 单位</label>
              <span className="text-sm text-slate-400 font-mono">红移值 (z): {z.toFixed(2)}</span>
            </div>
            <Slider 
              value={distance} 
              onValueChange={(val) => setDistance(val as number[])} 
              max={100} 
              step={1} 
              className="w-full"
            />
            <p className="text-xs text-slate-400">拖动滑块增加星系距离。距离越远，宇宙膨胀导致的光波拉伸越严重，颜色向红端移动（甚至进入不可见的红外区域）。</p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 text-sm text-slate-300">
            <strong>原理解析：</strong> 
            由于宇宙空间本身在不断膨胀，遥远星系发出的光在穿越空间到达地球的过程中，其波长会被拉长。波长变长意味着光向光谱的红端移动，这就是“红移”。
            <br/><br/>
            <strong>JWST的使命：</strong> 
            宇宙大爆炸后形成的第一批星系距离我们极其遥远，它们发出的紫外线和可见光经过漫长的旅途，波长被拉伸到了红外线波段。因此，詹姆斯·韦伯空间望远镜（JWST）专门设计用于观测红外线，以便“看穿”时间，观测早期宇宙。
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
