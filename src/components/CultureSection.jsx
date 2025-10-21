import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CultureSection.css';

gsap.registerPlugin(ScrollTrigger);

function MatatuModel({ scrollProgress, mousePosition }) {
  const { scene } = useGLTF('/3d-assets/graffiti+bus+3d+model.glb');
  const matatuRef = useRef();

  useFrame((state) => {
    if (matatuRef.current) {
      const time = state.clock.elapsedTime;
      const bounce = Math.sin(time * 3) * 0.08 + Math.cos(time * 2.3) * 0.04;
      const sway = Math.sin(time * 1.8) * 0.05;
      const tilt = Math.cos(time * 1.3) * 0.03;
      
      const targetRotY = scrollProgress * Math.PI * 3 + mousePosition.x * 0.5;
      const targetRotX = mousePosition.y * 0.3 + tilt;
      const targetRotZ = sway + Math.sin(scrollProgress * Math.PI * 2) * 0.08;
      
      matatuRef.current.rotation.y += (targetRotY - matatuRef.current.rotation.y) * 0.05;
      matatuRef.current.rotation.x += (targetRotX - matatuRef.current.rotation.x) * 0.05;
      matatuRef.current.rotation.z += (targetRotZ - matatuRef.current.rotation.z) * 0.05;
      
      matatuRef.current.position.y = bounce + scrollProgress * 0.5;
      matatuRef.current.position.x = Math.sin(scrollProgress * Math.PI * 2) * 1.5;
      matatuRef.current.position.z = Math.cos(scrollProgress * Math.PI) * 0.8;
      
      const scale = 2 + scrollProgress * 0.8;
      matatuRef.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={matatuRef} object={scene} scale={2} position={[0, 0, 0]} />;
}

function Scene({ scrollProgress, mousePosition }) {
  const cameraRef = useRef();
  const light1Ref = useRef();
  const light2Ref = useRef();
  const light3Ref = useRef();

  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.elapsedTime;
      const breathe = Math.sin(time * 0.4) * 0.15;
      
      const baseAngle = scrollProgress * Math.PI * 2.5;
      const mouseAngle = mousePosition.x * 0.3;
      const angle = baseAngle + mouseAngle;
      
      const baseRadius = 6 - scrollProgress * 3;
      const radius = Math.max(baseRadius, 2.5);
      
      const x = Math.sin(angle) * radius + mousePosition.x * 0.5;
      const z = Math.cos(angle) * radius;
      const y = 1.5 + scrollProgress * 2 + mousePosition.y * 0.8 + breathe;
      
      cameraRef.current.position.x += (x - cameraRef.current.position.x) * 0.08;
      cameraRef.current.position.y += (y - cameraRef.current.position.y) * 0.08;
      cameraRef.current.position.z += (z - cameraRef.current.position.z) * 0.08;
      
      const lookY = scrollProgress * 0.5 + Math.sin(time * 0.3) * 0.1;
      cameraRef.current.lookAt(0, lookY, 0);
      
      cameraRef.current.fov = 50 - scrollProgress * 15;
      cameraRef.current.updateProjectionMatrix();
    }

    if (light1Ref.current) {
      const time = state.clock.elapsedTime;
      light1Ref.current.position.x = Math.sin(time * 0.7) * 8;
      light1Ref.current.position.z = Math.cos(time * 0.7) * 8;
      light1Ref.current.intensity = 1.8 + Math.sin(time * 1.2) * 0.5;
    }

    if (light2Ref.current) {
      const time = state.clock.elapsedTime;
      light2Ref.current.position.x = Math.cos(time * 0.5 + Math.PI) * 6;
      light2Ref.current.position.z = Math.sin(time * 0.5 + Math.PI) * 6;
      light2Ref.current.intensity = 1.2 + Math.cos(time * 0.9) * 0.4;
    }

    if (light3Ref.current) {
      const time = state.clock.elapsedTime;
      light3Ref.current.intensity = 1 + Math.sin(time * 1.5) * 0.3;
      light3Ref.current.position.y = 6 + Math.sin(time * 0.6) * 1;
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[6, 1.5, 6]} fov={50} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 8, 5]} intensity={1.2} castShadow />
      <pointLight ref={light1Ref} position={[8, 4, 8]} intensity={1.8} color="#fbbf24" distance={18} decay={2} />
      <pointLight ref={light2Ref} position={[-6, 3, -6]} intensity={1.2} color="#ef4444" distance={15} decay={2} />
      <pointLight ref={light3Ref} position={[0, 6, 0]} intensity={1} color="#10b981" distance={12} decay={2} />
      <spotLight position={[5, 10, 5]} angle={0.5} intensity={1.5} penumbra={0.8} color="#a855f7" castShadow />
      <spotLight position={[-5, 10, -5]} angle={0.5} intensity={1.2} penumbra={0.8} color="#06b6d4" castShadow />
      <MatatuModel scrollProgress={scrollProgress} mousePosition={mousePosition} />
      <Environment preset="sunset" />
      <fog attach="fog" args={['#1a1a2e', 5, 20]} />
    </>
  );
}

export default function CultureSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const cardsRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        setMousePosition({ x, y });
      }
    };

    const section = sectionRef.current;
    section?.addEventListener('mousemove', handleMouseMove);
    return () => section?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const culturePoints = [
    {
      icon: "🚌",
      title: "First Models",
      text: "Matatus are our starting point—modeling the iconic buses that define Nairobi",
      color: "#fbbf24"
    },
    {
      icon: "🛣️",
      title: "Road Networks",
      text: "Building the streets and routes that connect the city, one road at a time",
      color: "#ef4444"
    },
    {
      icon: "🎨",
      title: "Graffiti Details",
      text: "Capturing the vibrant art and colors that make each matatu unique",
      color: "#10b981"
    },
    {
      icon: "⚡",
      title: "Street Energy",
      text: "Recreating the hustle and movement that brings Nairobi's roads to life",
      color: "#a855f7"
    },
    {
      icon: "🎵",
      title: "Sound Culture",
      text: "Planning audio systems to bring gengetone and street vibes to the world",
      color: "#06b6d4"
    },
    {
      icon: "🌟",
      title: "Authentic Feel",
      text: "From LED lights to unique names—every detail matters in our build",
      color: "#f59e0b"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => setScrollProgress(self.progress)
      });

      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 80, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      );

      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.5 }
      );

      cardsRef.current.forEach((card, i) => {
        if (card) {
          gsap.fromTo(card,
            { opacity: 0, y: 60, scale: 0.8, rotateY: -15 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateY: 0,
              duration: 0.8,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'top 60%',
                scrub: 1
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="culture-section">
      <div className="culture-canvas">
        <Canvas shadows>
          <Scene scrollProgress={scrollProgress} mousePosition={mousePosition} />
        </Canvas>
      </div>

      <div className="culture-overlay">
        <div className="culture-header">
          <div className="culture-badge">🇰🇪 Matatu Culture</div>
          <h2 ref={titleRef} className="culture-title">
            Starting with the <span className="gradient-text">Streets</span>
          </h2>
          <p ref={subtitleRef} className="culture-subtitle">
            We're building Nairobi from the ground up—starting with matatus and roads.
            These iconic buses are our first 3D models, capturing the soul of the city.
          </p>
        </div>

        <div className="culture-grid">
          {culturePoints.map((point, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className="culture-card"
              style={{ '--card-color': point.color }}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
              }}
            >
              <div className="card-shine"></div>
              <div className="card-content">
                <div className="culture-icon">{point.icon}</div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
