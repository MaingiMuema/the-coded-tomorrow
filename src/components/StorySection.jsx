import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StorySection.css';

gsap.registerPlugin(ScrollTrigger);

function RobotModel({ storyIndex }) {
  const { scene } = useGLTF('/3d-assets/robot_playground.glb');
  const robotRef = useRef();

  useFrame((state) => {
    if (robotRef.current) {
      const time = state.clock.elapsedTime;
      robotRef.current.rotation.y += 0.003;
      robotRef.current.position.y = -1 + Math.sin(time * 0.8) * 0.15;
      robotRef.current.rotation.x = Math.sin(time * 0.5) * 0.05;
      robotRef.current.rotation.z = Math.cos(time * 0.6) * 0.03;
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

  return <primitive ref={robotRef} object={scene} scale={2} position={[0, -1, 0]} />;
}

function Scene({ storyIndex, scrollProgress }) {
  const cameraRef = useRef();
  const targetRef = useRef({ x: 0, y: 0, z: 0 });

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
      
      const wobbleX = Math.sin(time * 0.5) * 0.3;
      const wobbleY = Math.cos(time * 0.3) * 0.2;
      const wobbleZ = Math.sin(time * 0.4) * 0.2;
      
      cameraRef.current.position.x += (pos[0] + wobbleX - cameraRef.current.position.x) * 0.05;
      cameraRef.current.position.y += (pos[1] + wobbleY - cameraRef.current.position.y) * 0.05;
      cameraRef.current.position.z += (pos[2] + wobbleZ - cameraRef.current.position.z) * 0.05;
      
      targetRef.current.x += (Math.sin(time * 0.2) * 0.5 - targetRef.current.x) * 0.1;
      targetRef.current.y += (Math.cos(time * 0.3) * 0.3 - targetRef.current.y) * 0.1;
      
      cameraRef.current.lookAt(targetRef.current.x, targetRef.current.y, targetRef.current.z);
      
      cameraRef.current.fov = 50 + Math.sin(scrollProgress * Math.PI) * 10;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1, 5]} fov={50} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#4f46e5" />
      <pointLight position={[5, -2, -3]} intensity={0.6} color="#ec4899" />
      <RobotModel storyIndex={storyIndex} />
      <Environment preset="city" />
    </>
  );
}

export default function StorySection() {
  const [storyIndex, setStoryIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef();
  const contentRefs = useRef([]);

  const stories = [
    {
      title: "Meet the Future",
      text: "In the robot playground, innovation comes alive. Each circuit tells a story of progress."
    },
    {
      title: "Building Tomorrow",
      text: "Where mechanical precision meets creative vision, the impossible becomes reality."
    },
    {
      title: "Code & Creation",
      text: "Every line of code breathes life into metal, transforming ideas into intelligent beings."
    },
    {
      title: "The Next Chapter",
      text: "As we push boundaries, we discover that the future is not just built—it's imagined."
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
        <Canvas>
          <Scene storyIndex={storyIndex} scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      <div className="story-content">
        {stories.map((story, index) => (
          <div
            key={index}
            ref={(el) => (contentRefs.current[index] = el)}
            className="story-card"
          >
            <h2>{story.title}</h2>
            <p>{story.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
