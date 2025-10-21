import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import { useAnimations } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import './StorySection.css';

gsap.registerPlugin(ScrollTrigger);

function Particles({ count = 100 }) {
  const points = useRef();
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#6366f1" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function RobotModel({ storyIndex, mousePosition }) {
  const { scene, animations } = useGLTF('/3d-assets/robot_playground.glb');
  const robotRef = useRef();
  const { actions } = useAnimations(animations, robotRef);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.reset().timeScale = 0.5;
        firstAction.play();
      }
    }
  }, [actions]);

  useFrame((state) => {
    if (robotRef.current) {
      const time = state.clock.elapsedTime;
      robotRef.current.rotation.y += 0.001;
      robotRef.current.position.y = -1 + Math.sin(time * 0.4) * 0.1;
      robotRef.current.rotation.x = Math.sin(time * 0.3) * 0.03 + mousePosition.y * 0.05;
      robotRef.current.rotation.z = Math.cos(time * 0.3) * 0.02 + mousePosition.x * 0.05;
    }
  });

  useEffect(() => {
    if (robotRef.current) {
      gsap.to(robotRef.current.rotation, {
        y: robotRef.current.rotation.y + Math.PI * 0.5,
        duration: 1.2,
        ease: 'power2.inOut'
      });
      gsap.to(robotRef.current.scale, {
        x: 1.8 + storyIndex * 0.15,
        y: 1.8 + storyIndex * 0.15,
        z: 1.8 + storyIndex * 0.15,
        duration: 1,
        ease: 'elastic.out(1, 0.5)'
      });
    }
  }, [storyIndex]);

  return <primitive ref={robotRef} object={scene} scale={1.5} position={[0, -1, 0]} />;
}

function Scene({ storyIndex, scrollProgress, mousePosition }) {
  const cameraRef = useRef();
  const targetRef = useRef({ x: 0, y: 0, z: 0 });
  const light1Ref = useRef();
  const light2Ref = useRef();
  const light3Ref = useRef();

  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.elapsedTime;
      const positions = [
        [0, 1, 5],
        [4, 2.5, 3],
        [-4, 1, 3.5],
        [0, 4, 7]
      ];
      const pos = positions[storyIndex] || positions[0];
      
      const wobbleX = Math.sin(time * 0.2) * 0.2;
      const wobbleY = Math.cos(time * 0.15) * 0.15;
      const wobbleZ = Math.sin(time * 0.2) * 0.15;
      
      cameraRef.current.position.x += (pos[0] + wobbleX + mousePosition.x * 2 - cameraRef.current.position.x) * 0.05;
      cameraRef.current.position.y += (pos[1] + wobbleY + mousePosition.y * 2 - cameraRef.current.position.y) * 0.05;
      cameraRef.current.position.z += (pos[2] + wobbleZ - cameraRef.current.position.z) * 0.05;
      
      targetRef.current.x += (Math.sin(time * 0.1) * 0.3 - targetRef.current.x) * 0.05;
      targetRef.current.y += (Math.cos(time * 0.15) * 0.2 - targetRef.current.y) * 0.05;
      
      cameraRef.current.lookAt(targetRef.current.x, targetRef.current.y, targetRef.current.z);
      
      cameraRef.current.fov = 50 + Math.sin(scrollProgress * Math.PI) * 10;
      cameraRef.current.updateProjectionMatrix();
    }

    if (light1Ref.current) {
      const time = state.clock.elapsedTime;
      light1Ref.current.position.x = Math.sin(time * 0.3) * 5;
      light1Ref.current.position.z = Math.cos(time * 0.3) * 5;
      light1Ref.current.intensity = 0.8 + Math.sin(time * 0.8) * 0.2;
    }

    if (light2Ref.current) {
      const time = state.clock.elapsedTime;
      light2Ref.current.position.x = Math.cos(time * 0.25) * 4;
      light2Ref.current.position.z = Math.sin(time * 0.25) * 4;
      light2Ref.current.intensity = 0.6 + Math.cos(time * 0.6) * 0.15;
    }

    if (light3Ref.current) {
      const time = state.clock.elapsedTime;
      light3Ref.current.intensity = 0.5 + Math.sin(time * 1) * 0.2;
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1, 5]} fov={50} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight ref={light1Ref} position={[-5, 3, -5]} intensity={0.8} color="#6366f1" distance={15} />
      <pointLight ref={light2Ref} position={[5, -2, -3]} intensity={0.6} color="#ec4899" distance={12} />
      <pointLight ref={light3Ref} position={[0, 5, 0]} intensity={0.5} color="#a855f7" distance={10} />
      <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={0.5} color="#8b5cf6" />
      <Particles count={150} />
      <RobotModel storyIndex={storyIndex} mousePosition={mousePosition} />
      <Environment preset="city" />
      <fog attach="fog" args={['#0f172a', 8, 20]} />
    </>
  );
}

export default function StorySection() {
  const [storyIndex, setStoryIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef();
  const contentRefs = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stories = [
    {
      badge: "🇰🇪 The Vision",
      title: "Nairobi in the Metaverse",
      text: "We're building a digital twin of Nairobi—a living, breathing simulation world that captures the soul of Kenya's capital. From bustling matatu routes to serene parks, every street tells a story.",
      stat: "100+ Locations"
    },
    {
      badge: "🎮 The Journey",
      title: "Building in Public",
      text: "Every line of code, every 3D model, every design decision—we document it all. Our dev logs chronicle the challenges, breakthroughs, and lessons learned in creating an authentic virtual city.",
      stat: "Daily Updates"
    },
    {
      badge: "🌍 The Mission",
      title: "Authentic Storytelling",
      text: "This isn't just a world—it's a digital archive of Nairobi's culture, architecture, and spirit. We're preserving our city's essence while imagining its future, one pixel at a time.",
      stat: "Real Stories"
    },
    {
      badge: "🚀 The Future",
      title: "Join the Build",
      text: "TheCodedTomorrow is more than an agency—we're a movement. Follow our journey as we push the boundaries of what's possible when creativity meets technology in the heart of East Africa.",
      stat: "Open Source"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.story-canvas-wrapper',
        scrub: 1,
        onUpdate: (self) => {
          const index = Math.min(Math.floor(self.progress * stories.length), stories.length - 1);
          setStoryIndex(index);
          setScrollProgress(self.progress);
        }
      });

      contentRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.fromTo(ref,
            { opacity: 0, y: 50, rotateX: -15 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              scrollTrigger: {
                trigger: ref,
                start: 'top 80%',
                end: 'top 30%',
                scrub: 1
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [stories.length]);

  return (
    <div ref={sectionRef} className="story-section">
      <div className="story-canvas-wrapper">
        <Canvas shadows>
          <Scene storyIndex={storyIndex} scrollProgress={scrollProgress} mousePosition={mousePosition} />
        </Canvas>
      </div>

      <div className="story-content">
        {stories.map((story, index) => (
          <div
            key={index}
            ref={(el) => (contentRefs.current[index] = el)}
            className="story-card"
          >
            <div className="story-badge">{story.badge}</div>
            <h2>{story.title}</h2>
            <p>{story.text}</p>
            <div className="story-stat">{story.stat}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
