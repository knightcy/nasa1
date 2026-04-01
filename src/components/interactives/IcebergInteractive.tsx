import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function IcebergModel({ activeLayer, setActiveLayer }: { activeLayer: string | null, setActiveLayer: (id: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const layers = [
    { id: "events", color: "#93c5fd", y: 1.5, scale: [1, 1, 1], height: 1 },
    { id: "patterns", color: "#60a5fa", y: 0, scale: [1.5, 1.5, 1.5], height: 1.5 },
    { id: "structures", color: "#2563eb", y: -2, scale: [2, 2, 2], height: 2 },
    { id: "mental-models", color: "#1e3a8a", y: -4.5, scale: [2.5, 2.5, 2.5], height: 2.5 }
  ];

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
        {layers.map((layer) => {
          const isActive = activeLayer === layer.id;
          return (
            <mesh 
              key={layer.id} 
              position={[0, layer.y, 0]} 
              scale={layer.scale as [number, number, number]}
              onClick={(e) => {
                e.stopPropagation();
                setActiveLayer(layer.id);
              }}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
            >
              <cylinderGeometry args={[0.5, 0.8, layer.height, 6]} />
              <meshStandardMaterial 
                color={layer.color} 
                roughness={0.2} 
                metalness={0.1}
                transparent
                opacity={0.9}
                emissive={isActive ? "#f97316" : "#000000"}
                emissiveIntensity={isActive ? 0.5 : 0}
              />
            </mesh>
          );
        })}
      </Float>
      
      {/* Water Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.4} roughness={0.1} />
      </mesh>
    </group>
  );
}

export default function IcebergInteractive() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const layers = [
    {
      id: "events",
      title: "事件 (Events)",
      description: "我们看到的表面现象。例如：某地发生极端干旱，或者一场罕见的暴风雪。",
      depth: "水面上"
    },
    {
      id: "patterns",
      title: "模式 (Patterns)",
      description: "随时间推移的趋势。例如：该地区干旱频率在过去十年中不断增加，或者极端天气事件的频率上升。",
      depth: "水面下浅层"
    },
    {
      id: "structures",
      title: "结构 (Structures)",
      description: "导致模式发生的基础设施、政策或物理系统。例如：全球洋流变化、温室气体排放增加、城市化导致的植被破坏。",
      depth: "水面下中层"
    },
    {
      id: "mental-models",
      title: "心智模式 (Mental Models)",
      description: "人们根深蒂固的信念、价值观和假设。例如：认为自然资源取之不尽用之不竭，或者认为经济发展必然以牺牲环境为代价。",
      depth: "水面下深层"
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-[var(--nasa-bg-hover)] bg-[var(--nasa-bg-secondary)]">
      <CardHeader>
        <CardTitle className="text-[var(--nasa-text)]">系统思维：冰山模型 (Iceberg Diagram)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="relative h-96 bg-[var(--nasa-bg-tertiary)] rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
            <color attach="background" args={['#020813']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <IcebergModel activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={0.2} />
          </Canvas>
          <div className="absolute top-2 right-2 text-xs text-[var(--nasa-text-secondary)] pointer-events-none bg-[var(--nasa-bg-tertiary)]/80 p-1 rounded">
            点击冰山各层查看详情 / 拖动旋转
          </div>
        </div>

        <div className="space-y-6">
          {/* @ts-ignore */}
          <Accordion type="single" collapsible value={activeLayer || undefined} onValueChange={setActiveLayer}>
            {layers.map(layer => (
              <AccordionItem key={layer.id} value={layer.id} className="border-[var(--nasa-bg-hover)]">
                <AccordionTrigger className="font-bold text-[var(--nasa-text)] hover:text-[var(--nasa-accent)]">{layer.title}</AccordionTrigger>
                <AccordionContent className="text-[var(--nasa-text-secondary)]">
                  {layer.description}
                  <div className="mt-4 p-3 bg-[var(--nasa-bg-tertiary)]/50 rounded border border-[var(--nasa-bg-hover)] text-sm text-[var(--nasa-text-secondary)]">
                    <strong>如何应对：</strong>
                    {layer.id === 'events' && ' 反应 (React) - 解决眼前的危机。'}
                    {layer.id === 'patterns' && ' 预测 (Anticipate) - 寻找规律并提前准备。'}
                    {layer.id === 'structures' && ' 设计 (Design) - 改变系统结构以避免问题发生。'}
                    {layer.id === 'mental-models' && ' 转变 (Transform) - 改变根本的信念和价值观，实现系统性变革。'}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="p-4 bg-[var(--nasa-bg-tertiary)]/50 rounded-md border border-[var(--nasa-bg-hover)] text-sm text-[var(--nasa-text-secondary)]">
            <strong>原理解析：</strong> 
            在面对复杂的全球性问题（如气候变化、教育不公平）时，我们往往只看到水面上的"事件"。冰山模型帮助我们向下挖掘，寻找导致这些事件反复发生的深层"模式"、"结构"和"心智模式"。只有改变最深层的心智模式，才能实现真正的系统性变革。
          </div>
        </div>

        <div className="space-y-6">
          {/* @ts-ignore */}
          <Accordion type="single" collapsible value={activeLayer || undefined} onValueChange={setActiveLayer}>
            {layers.map(layer => (
              <AccordionItem key={layer.id} value={layer.id} className="border-slate-800">
                <AccordionTrigger className="font-bold text-slate-200 hover:text-white">{layer.title}</AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  {layer.description}
                  <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700 text-sm text-slate-300">
                    <strong>如何应对：</strong>
                    {layer.id === 'events' && ' 反应 (React) - 解决眼前的危机。'}
                    {layer.id === 'patterns' && ' 预测 (Anticipate) - 寻找规律并提前准备。'}
                    {layer.id === 'structures' && ' 设计 (Design) - 改变系统结构以避免问题发生。'}
                    {layer.id === 'mental-models' && ' 转变 (Transform) - 改变根本的信念和价值观，实现系统性变革。'}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700 text-sm text-slate-300">
            <strong>原理解析：</strong> 
            在面对复杂的全球性问题（如气候变化、教育不公平）时，我们往往只看到水面上的“事件”。冰山模型帮助我们向下挖掘，寻找导致这些事件反复发生的深层“模式”、“结构”和“心智模式”。只有改变最深层的心智模式，才能实现真正的系统性变革。
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
