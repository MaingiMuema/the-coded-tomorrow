import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './DestinySection.css';

gsap.registerPlugin(ScrollTrigger);

function DestinyModel({ storyIndex }) {
  const { scene } = useGLTF('/3d-assets/destiny_2_character_bust.glb');
  const modelRef = useRef();

  useFrame((state) => {
    if (modelRef.current) {
      const time = state.clock.elapsedTime;
      modelRef.current.rotation.y += 0.002;
      modelRef.current.position.y = Math.sin(time * 0.6) * 0.08;
      modelRef.current.rotation.z = Math.sin(time * 0.4) * 0.02;
    }
  });

  useEffect(() => {
    if (modelRef.current) {
      gsap.to(modelRef.current.rotation, {
        y: modelRef.current.rotation.y + Math.PI * 0.4,
        duration: 1.3,
        ease: 'power2.inOut'
      });
      gsap.to(modelRef.current.scale, {
        x: 2 + storyIndex * 0.12,
        y: 2 + storyIndex * 0.12,
        z: 2 + storyIndex * 0.12,
        duration: 1.1,
        ease: 'elastic.out(1, 0.6)'
      });
    }
  }, [storyIndex]);

  return <primitive ref={modelRef} object={scene} scale={0.6} position={[0, -1.5, 0]} />;
}

function Scene({ storyIndex, scrollProgress }) {
  const cameraRef = useRef();
  const targetRef = useRef({ x: 0, y: 0, z: 0 });

  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.elapsedTime;
      const positions = [
        [0, 0, 15],
        [6, 1, 14],
        [-6, 0.5, 14.5],
        [0, 2, 16]
      ];
      const pos = positions[storyIndex] || positions[0];
      
      const wobbleX = Math.sin(time * 0.45) * 0.35;
      const wobbleY = Math.cos(time * 0.3) * 0.2;
      const wobbleZ = Math.sin(time * 0.38) * 0.25;
      
      cameraRef.current.position.x += (pos[0] + wobbleX - cameraRef.current.position.x) * 0.045;
      cameraRef.current.position.y += (pos[1] + wobbleY - cameraRef.current.position.y) * 0.045;
      cameraRef.current.position.z += (pos[2] + wobbleZ - cameraRef.current.position.z) * 0.045;
      
      targetRef.current.x += (Math.sin(time * 0.18) * 0.5 - targetRef.current.x) * 0.09;
      targetRef.current.y += (Math.cos(time * 0.22) * 0.35 - targetRef.current.y) * 0.09;
      
      cameraRef.current.lookAt(targetRef.current.x, targetRef.current.y, targetRef.current.z);
      
      cameraRef.current.fov = 50 + Math.sin(scrollProgress * Math.PI) * 15;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 15]} fov={50} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 6, 4]} intensity={1.3} />
      <pointLight position={[-5, 3, -3]} intensity={1} color="#3b82f6" />
      <pointLight position={[5, -2, 3]} intensity={0.8} color="#8b5cf6" />
      <spotLight position={[0, 5, 2]} angle={0.4} intensity={1.2} color="#60a5fa" />
      <DestinyModel storyIndex={storyIndex} />
      <Environment preset="sunset" />
    </>
  );
}

export default function DestinySection() {
  const [storyIndex, setStoryIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef();
  const contentRefs = useRef([]);

  const stories = [
    {
      title: "Legends Rise",
      text: "In the realm of heroes, every guardian carries the weight of destiny and the spark of hope."
    },
    {
      title: "Forged in Light",
      text: "Through trials and triumphs, character is built one battle at a time, one choice at a time."
    },
    {
      title: "Beyond the Stars",
      text: "The journey transcends worlds, where courage meets technology in an eternal dance."
    },
    {
      title: "Eternal Guardian",
      text: "Standing at the edge of tomorrow, we become the heroes our future needs us to be."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.destiny-canvas-wrapper',
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
            { opacity: 0, scale: 0.8, rotateZ: -5 },
            {
              opacity: 1,
              scale: 1,
              rotateZ: 0,
              scrollTrigger: {
                trigger: ref,
                start: 'top 78%',
                end: 'top 32%',
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
    <div ref={sectionRef} className="destiny-section">
      <div className="destiny-canvas-wrapper">
        <Canvas>
          <Scene storyIndex={storyIndex} scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      <div className="destiny-content">
        {stories.map((story, index) => (
          <div
            key={index}
            ref={(el) => (contentRefs.current[index] = el)}
            className="destiny-card"
          >
            <h2>{story.title}</h2>
            <p>{story.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
