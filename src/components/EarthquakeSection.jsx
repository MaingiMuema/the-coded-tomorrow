import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './EarthquakeSection.css';

gsap.registerPlugin(ScrollTrigger);

function EarthquakeModel({ storyIndex }) {
  const { scene } = useGLTF('/3d-assets/earthquakes_-_2000_to_2019.glb');
  const modelRef = useRef();

  useFrame((state) => {
    if (modelRef.current) {
      const time = state.clock.elapsedTime;
      modelRef.current.rotation.y += 0.001;
      modelRef.current.position.y = Math.sin(time * 0.4) * 0.1;
      modelRef.current.rotation.x = Math.sin(time * 0.3) * 0.02;
    }
  });

  useEffect(() => {
    if (modelRef.current) {
      gsap.to(modelRef.current.rotation, {
        y: modelRef.current.rotation.y + Math.PI * 0.3,
        duration: 1.5,
        ease: 'power3.inOut'
      });
      gsap.to(modelRef.current.scale, {
        x: 1.5 + storyIndex * 0.08,
        y: 1.5 + storyIndex * 0.08,
        z: 1.5 + storyIndex * 0.08,
        duration: 1.2,
        ease: 'back.out(1.2)'
      });
    }
  }, [storyIndex]);

  return <primitive ref={modelRef} object={scene} scale={1.5} position={[0, 0, 0]} />;
}

function Scene({ storyIndex, scrollProgress }) {
  const cameraRef = useRef();
  const targetRef = useRef({ x: 0, y: 0, z: 0 });

  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.elapsedTime;
      const positions = [
        [0, 2, 8],
        [5, 3, 6],
        [-5, 2, 7],
        [0, 5, 10]
      ];
      const pos = positions[storyIndex] || positions[0];
      
      const wobbleX = Math.sin(time * 0.4) * 0.4;
      const wobbleY = Math.cos(time * 0.25) * 0.25;
      const wobbleZ = Math.sin(time * 0.35) * 0.3;
      
      cameraRef.current.position.x += (pos[0] + wobbleX - cameraRef.current.position.x) * 0.04;
      cameraRef.current.position.y += (pos[1] + wobbleY - cameraRef.current.position.y) * 0.04;
      cameraRef.current.position.z += (pos[2] + wobbleZ - cameraRef.current.position.z) * 0.04;
      
      targetRef.current.x += (Math.sin(time * 0.15) * 0.6 - targetRef.current.x) * 0.08;
      targetRef.current.y += (Math.cos(time * 0.2) * 0.4 - targetRef.current.y) * 0.08;
      
      cameraRef.current.lookAt(targetRef.current.x, targetRef.current.y, targetRef.current.z);
      
      cameraRef.current.fov = 55 + Math.sin(scrollProgress * Math.PI) * 12;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 8]} fov={55} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 8, 5]} intensity={1} />
      <pointLight position={[-6, 4, -4]} intensity={0.9} color="#6366f1" />
      <pointLight position={[6, -3, 4]} intensity={0.7} color="#8b5cf6" />
      <pointLight position={[0, -5, 0]} intensity={0.5} color="#ec4899" />
      <EarthquakeModel storyIndex={storyIndex} />
      <Environment preset="night" />
    </>
  );
}

export default function EarthquakeSection() {
  const [storyIndex, setStoryIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef();
  const contentRefs = useRef([]);

  const stories = [
    {
      badge: "🌱 Just Starting",
      title: "The Beginning of Something Big",
      text: "We're at the start of an ambitious journey to build a Nairobi simulation world. It's early days, but we're excited about what's ahead and ready to learn as we go.",
      metric: "Day One"
    },
    {
      badge: "🤝 Join Us",
      title: "Looking for 3D Artists",
      text: "We need talented developers who can create 3D models and animations using modern tools like Blender, Spline, and AI-powered workflows. Your skills can help bring Nairobi to life.",
      metric: "Open Roles"
    },
    {
      badge: "🤖 AI-Powered",
      title: "Modern Tools & Workflows",
      text: "We're leveraging AI tools and cutting-edge tech to accelerate development. From procedural generation to AI-assisted modeling—we're exploring every possibility to build smarter.",
      metric: "AI-First"
    },
    {
      badge: "📚 Learn Together",
      title: "Growing as We Build",
      text: "This is a learning journey for all of us. We hope to go far, document everything, and grow our skills together. Join our community and let's build the future of Nairobi.",
      metric: "Community"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.earthquake-canvas-wrapper',
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
            { opacity: 0, x: index % 2 === 0 ? -60 : 60, rotateY: index % 2 === 0 ? -10 : 10 },
            {
              opacity: 1,
              x: 0,
              rotateY: 0,
              scrollTrigger: {
                trigger: ref,
                start: 'top 75%',
                end: 'top 35%',
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
    <div ref={sectionRef} className="earthquake-section">
      <div className="earthquake-canvas-wrapper">
        <Canvas>
          <Scene storyIndex={storyIndex} scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      <div className="earthquake-content">
        {stories.map((story, index) => (
          <div
            key={index}
            ref={(el) => (contentRefs.current[index] = el)}
            className={`earthquake-card ${index % 2 === 0 ? 'left' : 'right'}`}
          >
            <div className="earthquake-badge">{story.badge}</div>
            <h2>{story.title}</h2>
            <p>{story.text}</p>
            <div className="earthquake-metric">{story.metric}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
