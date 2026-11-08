import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const NODE_LABELS = ['AVL', 'DP', 'REACT', 'ML', 'GRAPH', 'CLOUD', 'OS', 'WEB', 'NLP', 'SQL', 'DSA', 'AI'];

function Network() {
  const group = useRef(null); const pointer = useRef({ x:0, y:0 });
  const nodes = useMemo(() => NODE_LABELS.map((label, index) => ({ label, position: [Math.cos(index * .54) * (1.7 + index % 3 * .28), Math.sin(index * .91) * 1.35, (index % 4 - 1.5) * .42] })), []);
  const links = useMemo(() => nodes.flatMap((node, index) => index < nodes.length - 1 ? [{ start: node.position, end: nodes[index + 1].position }] : []).concat([{ start:nodes[0].position, end:nodes[5].position }, { start:nodes[3].position, end:nodes[10].position }, { start:nodes[2].position, end:nodes[8].position }]), [nodes]);
  const particles = useMemo(() => new Float32Array(Array.from({ length: 270 }, (_, index) => index % 3 === 0 ? (Math.random() - .5) * 6 : (Math.random() - .5) * 4)), []);
  useFrame((state, delta) => { if (!group.current) return; group.current.rotation.y += delta * .06; group.current.rotation.x += (pointer.current.y * .08 - group.current.rotation.x) * .04; group.current.rotation.z += (pointer.current.x * .04 - group.current.rotation.z) * .04; });
  return <group ref={group} onPointerMove={event => { pointer.current.x = event.pointer.x; pointer.current.y = event.pointer.y; }}>
    <Points positions={particles} stride={3}><PointMaterial transparent color="#7dd3fc" size={.025} sizeAttenuation depthWrite={false} opacity={.55} /></Points>
    {links.map((link, index) => <Line key={index} points={[link.start, link.end]} color={index % 2 ? '#8b5cf6' : '#38bdf8'} transparent opacity={.48} lineWidth={.8} />)}
    {nodes.map((node, index) => <mesh key={node.label} position={node.position}><sphereGeometry args={[index % 4 === 0 ? .1 : .065, 16, 16]} /><meshStandardMaterial color={index % 3 === 0 ? '#a78bfa' : '#38bdf8'} emissive={index % 3 === 0 ? '#7c3aed' : '#0284c7'} emissiveIntensity={2.4} toneMapped={false} /></mesh>)}
  </group>;
}

export default function Hero3D() { return <div className="hero-3d"><Canvas camera={{ position:[0,0,6], fov:45 }} dpr={[1,1.5]} gl={{ antialias:true, alpha:true }}><ambientLight intensity={.35}/><pointLight position={[2,2,4]} intensity={4} color="#8b5cf6"/><Network/></Canvas></div>; }
