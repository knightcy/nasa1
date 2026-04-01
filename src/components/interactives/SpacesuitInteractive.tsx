import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// A simple 3D target
function Target({ position, onClick }: { position: [number, number, number], onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <mesh 
      position={position} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial color={hovered ? "#ef4444" : "#f87171"} emissive="#991b1b" emissiveIntensity={0.5} />
    </mesh>
  );
}

// The clumsy glove cursor
function GloveCursor({ mousePos }: { mousePos: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      // Lerp towards mouse position, but slowly to simulate clumsiness
      ref.current.position.lerp(mousePos, delta * 3);
      
      // Add some jitter
      ref.current.position.x += (Math.random() - 0.5) * 0.05;
      ref.current.position.y += (Math.random() - 0.5) * 0.05;
      
      ref.current.rotation.x += delta;
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#94a3b8" roughness={0.8} metalness={0.2} transparent opacity={0.8} />
    </mesh>
  );
}

export default function SpacesuitInteractive() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targets, setTargets] = useState<{ id: number; pos: [number, number, number] }[]>([]);
  const [mousePos, setMousePos] = useState(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setTargets(prev => [
          ...prev,
          {
            id: Date.now(),
            pos: [
              (Math.random() - 0.5) * 8, // x: -4 to 4
              (Math.random() - 0.5) * 6, // y: -3 to 3
              0 // z: 0
            ]
          }
        ]);
      }, 1500);

      const timeout = setTimeout(() => {
        setIsPlaying(false);
        setTargets([]);
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isPlaying]);

  const handlePointerMove = (e: any) => {
    // Convert screen coordinates to world coordinates at z=0
    const vec = new THREE.Vector3(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
      0.5
    );
    vec.unproject(e.camera);
    vec.sub(e.camera.position).normalize();
    const distance = -e.camera.position.z / vec.z;
    const pos = new THREE.Vector3().copy(e.camera.position).add(vec.multiplyScalar(distance));
    setMousePos(pos);
  };

  const handleTargetClick = (id: number) => {
    setScore(s => s + 1);
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const startGame = () => {
    setScore(0);
    setTargets([]);
    setIsPlaying(true);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-[var(--nasa-bg-hover)] bg-[var(--nasa-bg-secondary)]">
      <CardHeader>
        <CardTitle className="text-[var(--nasa-text)]">南极生存：太空服手套灵巧性测试</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-[var(--nasa-text)]">得分: {score}</span>
          <Button onClick={startGame} disabled={isPlaying} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isPlaying ? '测试进行中...' : '开始30秒测试'}
          </Button>
        </div>

        <div className="relative h-96 bg-[var(--nasa-bg-tertiary)] rounded-lg overflow-hidden cursor-none border border-[var(--nasa-bg-hover)]">
          <Canvas 
            camera={{ position: [0, 0, 10], fov: 50 }}
            onPointerMove={handlePointerMove}
          >
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            
            {/* Background grid */}
            <gridHelper args={[20, 20, '#1e293b', '#0f172a']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} />

            {targets.map(target => (
              <Target 
                key={target.id} 
                position={target.pos} 
                onClick={() => handleTargetClick(target.id)} 
              />
            ))}

            <GloveCursor mousePos={mousePos} />
            
            {/* We don't want orbit controls here as it interferes with the mouse tracking game */}
          </Canvas>
          
          {!isPlaying && score === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[var(--nasa-text-secondary)] text-lg">点击"开始测试"</span>
            </div>
          )}
          {!isPlaying && score > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[var(--nasa-bg-tertiary)]/80">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[var(--nasa-text)] mb-2">测试结束</h3>
                <p className="text-[var(--nasa-text-secondary)]">最终得分: {score}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[var(--nasa-bg-tertiary)]/50 rounded-md border border-[var(--nasa-bg-hover)] text-sm text-[var(--nasa-text-secondary)]">
          <strong>原理解析：</strong> 
          在加压的太空服（EVA服）中，手套就像充满了高压气体的气球。宇航员每次弯曲手指都需要克服气压的阻力，这极大地消耗了体力，并降低了手指的灵巧性。
          <br/><br/>
          <strong>极限工程：</strong> 
          为了在月球南极极寒（-248°C）环境下生存，手套还需要增加多层绝缘材料（MLI）和加热层，这使得手套更加笨重。工程师必须在保暖、防微陨石、维持气压和保持灵巧性之间寻找最佳的妥协方案。
        </div>
      </CardContent>
    </Card>
  );
}
