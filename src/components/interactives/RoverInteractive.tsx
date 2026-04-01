import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

const GRID_SIZE = 8;
const CELL_SIZE = 1;

function Rover({ position, targetRotation }: { position: [number, number, number], targetRotation: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth movement
      groupRef.current.position.lerp(new THREE.Vector3(...position), delta * 5);
      
      // Smooth rotation
      const currentRotation = groupRef.current.rotation.y;
      // Handle wrap around for rotation
      let diff = targetRotation - currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * delta * 5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <Box args={[0.6, 0.3, 0.8]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#cbd5e1" />
      </Box>
      {/* Wheels */}
      <Cylinder args={[0.15, 0.15, 0.1]} rotation={[0, 0, Math.PI / 2]} position={[0.35, 0.15, 0.3]}>
        <meshStandardMaterial color="#334155" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.1]} rotation={[0, 0, Math.PI / 2]} position={[-0.35, 0.15, 0.3]}>
        <meshStandardMaterial color="#334155" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.1]} rotation={[0, 0, Math.PI / 2]} position={[0.35, 0.15, -0.3]}>
        <meshStandardMaterial color="#334155" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.1]} rotation={[0, 0, Math.PI / 2]} position={[-0.35, 0.15, -0.3]}>
        <meshStandardMaterial color="#334155" />
      </Cylinder>
      {/* Mast */}
      <Cylinder args={[0.05, 0.05, 0.4]} position={[0, 0.6, 0.2]}>
        <meshStandardMaterial color="#94a3b8" />
      </Cylinder>
      <Box args={[0.2, 0.1, 0.1]} position={[0, 0.8, 0.2]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>
    </group>
  );
}

function Crater({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.2, 0.4, 16]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="#431407" />
      </mesh>
    </group>
  );
}

function Target({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.3]} />
      <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function RoverInteractive() {
  const [roverPos, setRoverPos] = useState({ x: 0, y: 0 });
  const [roverRotation, setRoverRotation] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 7, y: 7 });
  const [craters, setCraters] = useState([
    { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
    { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 4, y: 5 },
    { x: 1, y: 6 }, { x: 6, y: 1 }
  ]);
  const [message, setMessage] = useState('规划一条避开陨石坑的路线到达目标点。');
  const [gameOver, setGameOver] = useState(false);

  const moveRover = useCallback((dx: number, dy: number) => {
    if (gameOver) return;

    // Calculate rotation based on direction
    let newRot = roverRotation;
    if (dx === 1) newRot = Math.PI / 2;
    else if (dx === -1) newRot = -Math.PI / 2;
    else if (dy === 1) newRot = 0;
    else if (dy === -1) newRot = Math.PI;

    setRoverRotation(newRot);

    setRoverPos(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;

      // Check bounds
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        return prev;
      }

      // Check craters
      if (craters.some(c => c.x === newX && c.y === newY)) {
        setMessage('警告：探测器陷入陨石坑！任务失败。');
        setGameOver(true);
        return { x: newX, y: newY }; // Move into crater then stop
      }

      // Check win
      if (newX === targetPos.x && newY === targetPos.y) {
        setMessage('任务成功！探测器安全抵达目标区域。');
        setGameOver(true);
      } else {
        setMessage('探测器移动中...');
      }

      return { x: newX, y: newY };
    });
  }, [craters, targetPos, gameOver, roverRotation]);

  const reset = () => {
    setRoverPos({ x: 0, y: 0 });
    setRoverRotation(0);
    setMessage('规划一条避开陨石坑的路线到达目标点。');
    setGameOver(false);
  };

  // Convert grid coordinates to world coordinates
  const getPos = (x: number, y: number): [number, number, number] => {
    const offsetX = (GRID_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2;
    const offsetZ = (GRID_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2;
    return [x * CELL_SIZE - offsetX, 0, y * CELL_SIZE - offsetZ];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-[var(--nasa-bg-hover)] bg-[var(--nasa-bg-secondary)]">
      <CardHeader>
        <CardTitle className="text-[var(--nasa-text)]">火星制图师：探测器路径规划</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-96 bg-[var(--nasa-bg-tertiary)] rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 8, 8], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
            
            {/* Mars Surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
              <planeGeometry args={[GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE]} />
              <meshStandardMaterial color="#9a3412" roughness={0.9} />
            </mesh>
            
            {/* Grid Lines */}
            <gridHelper args={[GRID_SIZE * CELL_SIZE, GRID_SIZE, '#c2410c', '#7c2d12']} position={[0, 0.01, 0]} />

            {/* Craters */}
            {craters.map((c, i) => (
              <Crater key={i} position={getPos(c.x, c.y)} />
            ))}

            {/* Target */}
            <Target position={[...getPos(targetPos.x, targetPos.y).slice(0, 1), 0.5, getPos(targetPos.x, targetPos.y)[2]] as [number, number, number]} />

            {/* Rover */}
            <Rover position={getPos(roverPos.x, roverPos.y)} targetRotation={roverRotation} />

            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} minPolarAngle={0.1} />
          </Canvas>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-3 gap-2 w-48">
            <div />
            <Button variant="outline" onClick={() => moveRover(0, -1)} disabled={gameOver} className="border-[var(--nasa-bg-hover)] text-[var(--nasa-text-secondary)] hover:bg-[var(--nasa-bg-hover)]">↑</Button>
            <div />
            <Button variant="outline" onClick={() => moveRover(-1, 0)} disabled={gameOver} className="border-[var(--nasa-bg-hover)] text-[var(--nasa-text-secondary)] hover:bg-[var(--nasa-bg-hover)]">←</Button>
            <Button variant="outline" onClick={() => moveRover(0, 1)} disabled={gameOver} className="border-[var(--nasa-bg-hover)] text-[var(--nasa-text-secondary)] hover:bg-[var(--nasa-bg-hover)]">↓</Button>
            <Button variant="outline" onClick={() => moveRover(1, 0)} disabled={gameOver} className="border-[var(--nasa-bg-hover)] text-[var(--nasa-text-secondary)] hover:bg-[var(--nasa-bg-hover)]">→</Button>
          </div>

          <div className="flex gap-4 items-center">
            <Button variant="secondary" onClick={reset} className="bg-[var(--nasa-bg-hover)] hover:bg-[var(--nasa-bg-tertiary)] text-[var(--nasa-text)]">重置任务</Button>
            <span className={`font-medium ${message.includes('失败') ? 'text-red-500' : message.includes('成功') ? 'text-green-500' : 'text-[var(--nasa-text-secondary)]'}`}>
              {message}
            </span>
          </div>
        </div>

        <div className="p-4 bg-[var(--nasa-bg-tertiary)]/50 rounded-md border border-[var(--nasa-bg-hover)] text-sm text-[var(--nasa-text-secondary)]">
          <strong>原原理解析：</strong> 
          火星车（如毅力号、好奇号）在火星表面行驶时，必须避开深坑、陡坡和松软的沙地。由于地球和火星之间存在几分钟到二十几分钟的通信延迟，火星车不能像遥控汽车一样实时驾驶。
          <br/><br/>
          <strong>自主导航：</strong> 
          工程师利用轨道飞行器（如MRO）拍摄的高分辨率拓扑图，为火星车规划大致路线。火星车自身也配备了立体相机和激光雷达，利用自主导航软件（AutoNav）在行驶过程中实时识别并避开局部障碍物。
        </div>
      </CardContent>
    </Card>
  );
}
