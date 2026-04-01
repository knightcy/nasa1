import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

function SolarSystem({ isTransferring, transferProgress, onTransferComplete }: { isTransferring: boolean, transferProgress: number, onTransferComplete: () => void }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const marsRef = useRef<THREE.Mesh>(null);
  const scRef = useRef<THREE.Mesh>(null);
  
  const earthRadius = 3;
  const marsRadius = 4.5;
  const earthSpeed = 1;
  const marsSpeed = 0.53; // Roughly accurate relative speed

  const [transferStartAngle, setTransferStartAngle] = useState(0);

  // Initial offset for Mars so it aligns occasionally
  const marsInitialOffset = Math.PI / 4;

  useEffect(() => {
    if (isTransferring && transferProgress === 0) {
      // Capture the angle when transfer starts
      if (earthRef.current) {
        const angle = Math.atan2(earthRef.current.position.z, earthRef.current.position.x);
        setTransferStartAngle(angle);
      }
    }
  }, [isTransferring, transferProgress]);

  useFrame((state, delta) => {
    const currentTime = state.clock.elapsedTime;

    if (earthRef.current) {
      earthRef.current.position.x = Math.cos(currentTime * earthSpeed) * earthRadius;
      earthRef.current.position.z = Math.sin(currentTime * earthSpeed) * earthRadius;
      earthRef.current.rotation.y += delta;
    }

    if (marsRef.current) {
      marsRef.current.position.x = Math.cos(currentTime * marsSpeed + marsInitialOffset) * marsRadius;
      marsRef.current.position.z = Math.sin(currentTime * marsSpeed + marsInitialOffset) * marsRadius;
      marsRef.current.rotation.y += delta * 0.8;
    }

    if (scRef.current) {
      if (isTransferring || transferProgress > 0) {
        // Hohmann transfer math
        const a = (earthRadius + marsRadius) / 2;
        const e = (marsRadius - earthRadius) / (marsRadius + earthRadius);
        
        // Progress from 0 to 1 means angle from 0 to PI
        const theta = transferProgress * Math.PI;
        
        // Distance from sun
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        
        // Current angle
        const currentAngle = transferStartAngle + theta;
        
        scRef.current.position.x = Math.cos(currentAngle) * r;
        scRef.current.position.z = Math.sin(currentAngle) * r;
        
        if (transferProgress >= 1) {
          onTransferComplete();
        }
      } else {
        // Stick to Earth
        if (earthRef.current) {
          scRef.current.position.copy(earthRef.current.position);
          scRef.current.position.y += 0.2; // Slightly above Earth
        }
      }
    }
  });

  return (
    <group>
      {/* Sun */}
      <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#eab308" />
      </Sphere>
      <pointLight position={[0, 0, 0]} intensity={2} color="#fef08a" distance={20} />

      {/* Earth Orbit */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[earthRadius - 0.02, earthRadius + 0.02, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Mars Orbit */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[marsRadius - 0.02, marsRadius + 0.02, 64]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Earth */}
      <Sphere ref={earthRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial color="#3b82f6" roughness={0.6} />
      </Sphere>

      {/* Mars */}
      <Sphere ref={marsRef} args={[0.2, 32, 32]}>
        <meshStandardMaterial color="#ef4444" roughness={0.8} />
      </Sphere>

      {/* Spacecraft */}
      <Trail width={0.5} length={20} color={new THREE.Color('#ffffff')} attenuation={(t) => t * t}>
        <Sphere ref={scRef} args={[0.08, 16, 16]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
      </Trail>
    </group>
  );
}

export default function HohmannInteractive() {
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    if (isTransferring) {
      const animate = () => {
        setTransferProgress(p => {
          if (p >= 1) return 1;
          return p + 0.002; // Speed of transfer
        });
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isTransferring]);

  const startTransfer = () => {
    if (!isTransferring) {
      setTransferProgress(0);
      setIsTransferring(true);
    }
  };

  const reset = () => {
    setIsTransferring(false);
    setTransferProgress(0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-slate-800 bg-[#0b101a]">
      <CardHeader>
        <CardTitle className="text-white">恐怖七分钟：霍曼转移轨道</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-96 bg-slate-900 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 8, 8], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <SolarSystem 
              isTransferring={isTransferring} 
              transferProgress={transferProgress} 
              onTransferComplete={() => setIsTransferring(false)}
            />
            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} />
          </Canvas>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={startTransfer} disabled={isTransferring || transferProgress > 0} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isTransferring ? '转移中...' : '启动霍曼转移'}
          </Button>
          <Button variant="outline" onClick={reset} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            重置
          </Button>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 text-sm text-slate-300">
          <strong>原理解析：</strong> 
          霍曼转移轨道（Hohmann Transfer Orbit）是连接两个共面圆轨道的半椭圆轨道。它是最节省燃料的转移方式。
          <br/><br/>
          <strong>发射窗口：</strong> 
          你不能随时发射。探测器到达火星轨道时，火星必须正好运行到那个位置。这种特定的行星几何排列大约每26个月才出现一次。如果在错误的时间点击“启动”，探测器到达外轨道时，火星可能在轨道的另一侧！
        </div>
      </CardContent>
    </Card>
  );
}
