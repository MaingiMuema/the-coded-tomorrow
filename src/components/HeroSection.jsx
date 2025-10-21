import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HeroSection.css';

gsap.registerPlugin(ScrollTrigger);

function CarModel({ scrollProgress }) {
  const { scene } = useGLTF('/3d-assets/3d_handdrawn_car.glb');
  const carRef = useRef();

  useFrame((state) => {
    if (carRef.current) {
      const time = state.clock.elapsedTime;
      const idleRotation = Math.sin(time * 0.3) * 0.08;
      const idleFloat = Math.sin(time * 0.5) * 0.03;
      
      const scrollRotation = scrollProgress * Math.PI * 2.5;
      const scrollTilt = Math.sin(scrollProgress * Math.PI) * 0.15;
      const scrollLift = scrollProgress * 1.2;
      const scrollForward = scrollProgress * 3;
      
      carRef.current.rotation.y = scrollRotation + idleRotation;
      carRef.current.rotation.x = scrollTilt;
      carRef.current.rotation.z = Math.sin(scrollProgress * Math.PI * 2) * 0.1;
      carRef.current.position.y = 0.2 + scrollLift + idleFloat;
      carRef.current.position.z = scrollForward;
      
      const scale = 1.2 + scrollProgress * 0.5;
      carRef.current.scale.set(scale, scale, scale);
    }
  });

  return <primitive ref={carRef} object={scene} scale={1.2} position={[0, 0.2, 0]} />;
}

function Scene({ scrollProgress }) {
  const cameraRef = useRef();
  const lightRef = useRef();

  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.elapsedTime;
      const breathe = Math.sin(time * 0.4) * 0.3;
      
      if (scrollProgress < 0.33) {
        const t = gsap.utils.interpolate(0, 1, scrollProgress / 0.33, 0.3);
        const x = -6 + t * 8 + breathe;
        const y = 2 - t * 1.5;
        const z = 20 - t * 6;
        cameraRef.current.position.set(x, y, z);
        cameraRef.current.fov = 70 - t * 10;
      } else if (scrollProgress < 0.66) {
        const t = gsap.utils.interpolate(0, 1, (scrollProgress - 0.33) / 0.33, 0.3);
        const angle = t * Math.PI * 0.8;
        const radius = 14 - t * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = 3.5 + t * 1.5 + breathe * 0.5;
        cameraRef.current.position.set(x, y, z);
        cameraRef.current.fov = 60 + t * 15;
      } else {
        const t = gsap.utils.interpolate(0, 1, (scrollProgress - 0.66) / 0.34, 0.3);
        const x = 8 - t * 8;
        const y = 5 + t * 3;
        const z = 12 + t * 8;
        cameraRef.current.position.set(x, y, z);
        cameraRef.current.fov = 75 + t * 15;
      }
      
      const lookAtY = 0.2 + scrollProgress * 0.8;
      const lookAtZ = scrollProgress * 2;
      cameraRef.current.lookAt(0, lookAtY, lookAtZ);
      cameraRef.current.updateProjectionMatrix();
    }
    
    if (lightRef.current) {
      const angle = state.clock.elapsedTime * 0.5 + scrollProgress * Math.PI;
      lightRef.current.position.x = Math.sin(angle) * 12;
      lightRef.current.position.z = Math.cos(angle) * 12;
      lightRef.current.intensity = 1.2 + Math.sin(scrollProgress * Math.PI) * 0.5;
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[-6, 2, 20]} fov={70} />
      <ambientLight intensity={0.4} />
      <directionalLight ref={lightRef} position={[10, 10, 5]} intensity={1.2} castShadow />
      <spotLight position={[-10, 10, -5]} angle={0.3} intensity={0.6} penumbra={0.5} />
      <pointLight position={[0, 5, 0]} intensity={0.8} distance={20} decay={2} color="#a5b4fc" />
      <CarModel scrollProgress={scrollProgress} />
      <Environment preset="sunset" />
      <fog attach="fog" args={['#0a0e27', 15, 35]} />
    </>
  );
}

export default function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const ctaRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => setScrollProgress(self.progress)
      });

      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 }
      );

      gsap.fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.6 }
      );

      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.9 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="hero-section">
      <div className="canvas-container">
        <Canvas>
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </div>
      
      <div className="hero-content">
        <div className="hero-left">
          <div className="hero-badge">Nairobi • Kenya 🇰🇪</div>
          <h1 ref={titleRef} className="hero-title" style={{fontSize: '4.5rem'}}>
            Building
            <span className="gradient-text"> Nairobi</span>
            <br />In The Metaverse
          </h1>
          <p ref={subtitleRef} className="hero-subtitle">
            A digital creative agency crafting a virtual Nairobi simulation world.
            We document every step, share our journey, and build in public.
          </p>
          <div ref={ctaRef} className="hero-cta">
            <button className="btn-primary">Follow Our Journey</button>
            <button className="btn-secondary">View Dev Logs</button>
          </div>
        </div>

        <div className="hero-right">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>World Development</h3>
            <p>Nairobi simulation</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Build In Public</h3>
            <p>Documented journey</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Local Stories</h3>
            <p>Authentic Nairobi</p>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </div>
  );
}
