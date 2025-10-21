import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import './CreatorSection.css';

gsap.registerPlugin(ScrollTrigger);

function ParticleField({ storyPhase }) {
  const particlesRef = useRef();
  const particleCount = 800;
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    
    const color = new THREE.Color();
    color.setHSL(0.5 + Math.random() * 0.3, 0.8, 0.6);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function PortraitModel({ storyPhase, mousePosition }) {
  const { scene } = useGLTF('/3d-assets/The_Portrait_of_Stren_1021073426_texture.glb');
  const portraitRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (portraitRef.current) {
      const time = state.clock.elapsedTime;
      const targetRotationY = mousePosition.x * 0.5 + Math.sin(time * 0.3) * 0.2;
      const targetRotationX = mousePosition.y * 0.3 + Math.cos(time * 0.4) * 0.1;
      
      portraitRef.current.rotation.y += (targetRotationY - portraitRef.current.rotation.y) * 0.05;
      portraitRef.current.rotation.x += (targetRotationX - portraitRef.current.rotation.x) * 0.05;
      portraitRef.current.position.y = Math.sin(time * 0.6) * 0.12;
    }
  });

  useEffect(() => {
    if (portraitRef.current) {
      const configs = [
        { scale: 1.3, rotation: 0, position: [0, 0, 0] },
        { scale: 1.6, rotation: Math.PI * 0.4, position: [0.5, 0.2, 0] },
        { scale: 1.4, rotation: -Math.PI * 0.3, position: [-0.3, -0.1, 0.2] },
        { scale: 1.7, rotation: Math.PI * 0.2, position: [0, 0.3, -0.1] }
      ];
      const config = configs[storyPhase];
      
      gsap.to(portraitRef.current.scale, {
        x: config.scale,
        y: config.scale,
        z: config.scale,
        duration: 1.8,
        ease: 'power3.out'
      });
      
      gsap.to(portraitRef.current.position, {
        x: config.position[0],
        y: config.position[1],
        z: config.position[2],
        duration: 1.5,
        ease: 'power2.inOut'
      });
    }
  }, [storyPhase]);

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <primitive 
        ref={portraitRef} 
        object={scene} 
        scale={1.3} 
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
      {hovered && (
        <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#8a2be2"
            transparent
            opacity={0.15}
            distort={0.4}
            speed={2}
          />
        </Sphere>
      )}
    </Float>
  );
}

function Scene({ storyPhase, scrollProgress, mousePosition }) {
  const cameraRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.elapsedTime;
      const configs = [
        { pos: [0, 0.6, 4], lookAt: [0, 0.3, 0] },
        { pos: [2.5, 1, 3.5], lookAt: [0, 0.5, 0] },
        { pos: [-2.2, 0.4, 3.8], lookAt: [0, 0.2, 0] },
        { pos: [0, 1.5, 4.5], lookAt: [0, 0.6, 0] }
      ];
      const config = configs[storyPhase];
      
      const mouseInfluence = 0.3;
      const targetX = config.pos[0] + mousePosition.x * mouseInfluence + Math.sin(time * 0.2) * 0.15;
      const targetY = config.pos[1] + mousePosition.y * mouseInfluence + Math.cos(time * 0.3) * 0.1;
      const targetZ = config.pos[2];
      
      cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.04;
      cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.04;
      cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.04;
      
      cameraRef.current.lookAt(config.lookAt[0], config.lookAt[1], config.lookAt[2]);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.6, 4]} fov={50} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.8} color="#ffffff" castShadow />
      <pointLight position={[-4, 3, -3]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[4, -2, -3]} intensity={1.2} color="#ff6b35" />
      <spotLight position={[0, 6, 3]} angle={0.6} intensity={1.5} color="#ffd700" penumbra={0.5} />
      <pointLight position={[0, -3, 2]} intensity={0.8} color="#8a2be2" />
      <ParticleField storyPhase={storyPhase} />
      <PortraitModel storyPhase={storyPhase} mousePosition={mousePosition} />
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0e27', 5, 15]} />
    </>
  );
}

export default function CreatorSection() {
  const [storyPhase, setStoryPhase] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);
  const sectionRef = useRef();
  const storyRefs = useRef([]);

  const stories = [
    {
      title: "Meet Manlikemaingi",
      subtitle: "Founder & Creative Developer",
      text: "The visionary behind TheCodedTomorrow—a creative developer obsessed with building creative and immersive digital experiences. From concept to code, every pixel is crafted with purpose."
    },
    {
      title: "TheCodedTomorrow",
      subtitle: "Digital Creative Agency • Nairobi",
      text: "Born in Kenya's tech capital, we're a digital creative agency on a mission: create an immersive Nairobi simulation world while documenting every step of the journey."
    }
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const phase = Math.min(Math.floor(self.progress * stories.length), stories.length - 1);
          setStoryPhase(phase);
          setScrollProgress(self.progress);
        }
      });

      storyRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.fromTo(ref,
            { opacity: 0, y: 100, rotationX: -15, scale: 0.85 },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              scale: 1,
              scrollTrigger: {
                trigger: ref,
                start: 'top 80%',
                end: 'top 20%',
                scrub: 1.5
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [stories.length]);

  return (
    <div ref={sectionRef} className="creator-section">
      <div className="creator-canvas-wrapper" style={{ display: sectionRef.current ? 'block' : 'none' }}>
        <Canvas shadows>
          <Scene storyPhase={storyPhase} scrollProgress={scrollProgress} mousePosition={mousePosition} />
        </Canvas>
        <div className="canvas-overlay">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
        </div>
      </div>

      <div className="creator-content">
        {stories.map((story, index) => (
          <div
            key={index}
            ref={(el) => (storyRefs.current[index] = el)}
            className={`creator-story-card ${storyPhase === index ? 'active' : ''} ${activeCard === index ? 'hovered' : ''}`}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="card-glow"></div>
            <div className="story-number">0{index + 1}</div>
            <div className="story-icon">
              {index === 0 && '👨‍💻'}
              {index === 1 && '🏢'}
              {index === 2 && '🌆'}
              {index === 3 && '📡'}
            </div>
            <h2>{story.title}</h2>
            <h3>{story.subtitle}</h3>
            <p>{story.text}</p>
            <div className="story-accent"></div>
            <div className="card-particles">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="particle" style={{ '--delay': `${i * 0.2}s` }}></span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="progress-indicator">
        {stories.map((_, index) => (
          <div key={index} className={`progress-dot ${storyPhase === index ? 'active' : ''}`}></div>
        ))}
      </div>

      <div className="location-badge">
        <span className="pulse-dot"></span>
        <span>Nairobi, Kenya</span>
      </div>
    </div>
  );
}
