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
      carRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      carRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  useEffect(() => {
    if (carRef.current) {
      carRef.current.rotation.y = scrollProgress * Math.PI * 1.5;
    }
  }, [scrollProgress]);

  return <primitive ref={carRef} object={scene} scale={1.5} position={[0, -0.5, 0]} />;
}

function Scene({ scrollProgress }) {
  const cameraRef = useRef();

  useFrame(() => {
    if (cameraRef.current) {
      if (scrollProgress < 0.33) {
        const t = scrollProgress / 0.33;
        cameraRef.current.position.set(0, 2, 7 - t * 1.5);
        cameraRef.current.fov = 55 - t * 10;
      } else if (scrollProgress < 0.66) {
        const t = (scrollProgress - 0.33) / 0.33;
        cameraRef.current.position.set(t * 5, 2 + t * 1, 5.5 - t * 0.5);
        cameraRef.current.fov = 45 + t * 5;
      } else {
        const t = (scrollProgress - 0.66) / 0.34;
        cameraRef.current.position.set(5 - t * 2, 3 + t * 3, 5 + t * 2);
        cameraRef.current.fov = 50 + t * 15;
      }
      
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 7]} fov={55} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <spotLight position={[-10, 10, -5]} angle={0.3} intensity={0.5} />
      <CarModel scrollProgress={scrollProgress} />
      <Environment preset="sunset" />
    </>
  );
}

export default function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStory, setCurrentStory] = useState(0);
  const heroRef = useRef();
  const textRefs = useRef([]);

  const stories = [
    {
      title: "The Journey Begins",
      text: "In a world where code shapes reality, every line written drives us forward."
    },
    {
      title: "Innovation in Motion",
      text: "Technology accelerates, transforming dreams into digital destinations."
    },
    {
      title: "The Coded Tomorrow",
      text: "Where imagination meets execution, the future is built one commit at a time."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'hero-scroll',
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          const storyIndex = Math.min(Math.floor(self.progress * stories.length), stories.length - 1);
          setCurrentStory(storyIndex);
          
          textRefs.current.forEach((ref, index) => {
            if (ref) {
              const storyStart = index / stories.length;
              const storyEnd = (index + 1) / stories.length;
              const fadeRange = 0.1;
              
              let opacity = 0;
              if (self.progress >= storyStart && self.progress < storyStart + fadeRange) {
                opacity = (self.progress - storyStart) / fadeRange;
              } else if (self.progress >= storyStart + fadeRange && self.progress < storyEnd - fadeRange) {
                opacity = 1;
              } else if (self.progress >= storyEnd - fadeRange && self.progress < storyEnd) {
                opacity = 1 - (self.progress - (storyEnd - fadeRange)) / fadeRange;
              }
              
              ref.style.opacity = opacity;
            }
          });
        }
      });

      textRefs.current.forEach((ref) => {
        if (ref) {
          gsap.set(ref, { opacity: 0, y: 0 });
        }
      });

      textRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.to(ref, {
            opacity: (self) => {
              const progress = ScrollTrigger.getById('hero-scroll')?.progress || 0;
              const storyStart = index / stories.length;
              const storyEnd = (index + 1) / stories.length;
              const fadeRange = 0.1;
              
              if (progress < storyStart) return 0;
              if (progress < storyStart + fadeRange) {
                return (progress - storyStart) / fadeRange;
              }
              if (progress < storyEnd - fadeRange) return 1;
              if (progress < storyEnd) {
                return 1 - (progress - (storyEnd - fadeRange)) / fadeRange;
              }
              return 0;
            },
            y: 0,
            scrollTrigger: {
              id: index === 0 ? 'hero-scroll' : undefined,
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
              onUpdate: () => ref.style.opacity = ''
            }
          });
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, [stories.length]);

  return (
    <div ref={heroRef} className="hero-section">
      <div className="canvas-container">
        <Canvas>
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </div>
      
      <div className="story-overlay">
        <div className="brand-title">
          <h1>The Coded Tomorrow</h1>
          <p className="tagline">Driving Innovation Through Code</p>
        </div>

        {stories.map((story, index) => (
          <div
            key={index}
            ref={(el) => (textRefs.current[index] = el)}
            className={`story-text ${currentStory === index ? 'active' : ''}`}
          >
            <h2>{story.title}</h2>
            <p>{story.text}</p>
          </div>
        ))}
      </div>

      <div className="scroll-indicator">
        <span>Scroll to explore</span>
        <div className="scroll-arrow">↓</div>
      </div>
    </div>
  );
}
