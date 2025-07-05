'use client';

import React, { useCallback, memo } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Container, Engine, RecursivePartial, IOptions } from 'tsparticles-engine';

interface AnimatedBackgroundProps {
  variant?: 'space' | 'clouds' | 'nebula' | 'minimal' | 'geometric';
  density?: 'low' | 'medium' | 'high';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ variant = 'space', density = 'medium' }) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // Get particle count based on density
  const getParticleCount = useCallback((baseDensity: number): number => {
    switch (density) {
      case 'low': return Math.floor(baseDensity * 0.5);
      case 'high': return Math.floor(baseDensity * 1.5);
      case 'medium':
      default: return baseDensity;
    }
  }, [density]);

  const getConfig = useCallback((): RecursivePartial<IOptions> => {
    // Space configuration (default)
    if (variant === 'space') {
      return {
        fullScreen: false,
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 30, // Reduced from 60 for better performance
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
            onClick: {
              enable: false,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
            push: {
              quantity: 4,
            },
          },
        },
        particles: {
          color: { value: '#ff00b8' },
          links: {
            color: '#00ffff', // Chad neon
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          move: {
            direction: "none" as any, // Type casting to fix TS error
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: true,
            speed: 0.5,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: getParticleCount(40),
          },
          opacity: {
            value: 0.5,
            random: true,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 5 },
            random: true,
          },
        },
        detectRetina: true,
      };
    }

    // Clouds configuration
    if (variant === 'clouds') {
      return {
        fullScreen: false,
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 30,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "bubble",
            },
            onClick: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            bubble: {
              distance: 250,
              duration: 2,
              opacity: 0.8,
              size: 40,
            },
            repulse: {
              distance: 400,
              duration: 4,
            },
          },
        },
        particles: {
          color: {
            value: "#ffffff",
          },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: false,
            opacity: 0.5,
            width: 1,
          },
          move: {
            direction: "none" as any,
            enable: true,
            outModes: {
              default: "out",
            },
            random: true,
            speed: 0.3,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: getParticleCount(30),
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 10 },
          },
        },
        detectRetina: true,
      };
    }

    // Nebula configuration
    if (variant === 'nebula') {
      return {
        fullScreen: false,
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 30,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
            onClick: {
              enable: true,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.8,
              },
            },
            push: {
              quantity: 4,
            },
          },
        },
        particles: {
          color: {
            value: ['#ff00b8', '#00ffff', '#8A2BE2', '#FF1493'],
          },
          links: {
            color: '#ff00b8',
            distance: 150,
            enable: true,
            opacity: 0.4,
            width: 1.5,
          },
          move: {
            direction: "none" as any,
            enable: true,
            outModes: {
              default: "out",
            },
            random: true,
            speed: 0.6,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: getParticleCount(70),
          },
          opacity: {
            value: 0.8,
            random: true,
          },
          shape: {
            type: ["circle", "triangle", "polygon"],
          },
          size: {
            value: { min: 2, max: 10 },
            random: true,
          },
          blur: {
            value: 0,
          },
        },
        detectRetina: true,
      };
    }

    // Minimal configuration - very lightweight
    if (variant === 'minimal') {
      return {
        fullScreen: false,
        background: { color: { value: 'transparent' } },
        fpsLimit: 30,
        interactivity: {
          events: { 
            onHover: { enable: true, mode: "connect" },
            onClick: { enable: false },
            resize: true 
          },
          modes: { 
            connect: { 
              distance: 200,
              links: { opacity: 0.3 },
              radius: 120
            } 
          }
        },
        particles: {
          color: { value: ['#ff00b8', '#00ffff'] },
          links: { 
            color: '#ff00b8',
            distance: 150,
            enable: true,
            opacity: 0.2,
            width: 1 
          },
          move: { 
            enable: true,
            speed: 0.3,
            direction: "none" as any,
            random: false,
            straight: false,
            outModes: { default: "out" }
          },
          number: { 
            density: { enable: true, area: 1000 },
            value: getParticleCount(30) // Very low particle count for performance
          },
          opacity: { value: 0.5 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } }
        },
        detectRetina: true
      };
    }

    // Geometric configuration - different shapes
    if (variant === 'geometric') {
      return {
        fullScreen: false,
        background: { color: { value: 'transparent' } },
        fpsLimit: 30,
        interactivity: {
          events: { 
            onHover: { enable: true, mode: "light" },
            onClick: { enable: true, mode: "push" },
            resize: true 
          },
          modes: { 
            light: {
              area: {
                gradient: {
                  start: "#ffffff",
                  stop: "#000000"
                }
              },
              shadow: {
                color: "#000000"
              },
              radius: 200
            },
            push: { quantity: 2 }
          }
        },
        particles: {
          color: { value: ['#ff00b8', '#00ffff', '#8A2BE2'] },
          links: { enable: false },
          move: { 
            enable: true,
            speed: 0.4,
            direction: "none" as any,
            random: true,
            straight: false,
            outModes: { default: "bounce" }
          },
          number: { 
            density: { enable: true, area: 800 },
            value: getParticleCount(40)
          },
          opacity: { value: 0.7, random: true },
          shape: { 
            type: ["triangle", "polygon", "star", "square"]
          },
          size: { value: { min: 3, max: 8 }, random: true }
        },
        detectRetina: true
      };
    }

    // Default space configuration (optimized)
    return {
      fullScreen: false,
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 30, // Reduced for better performance
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
          onClick: {
            enable: false,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 0.5,
            },
          },
          push: {
            quantity: 4,
          },
        },
      },
      particles: {
        color: {
          value: '#ff00b8',
        },
        links: {
          color: '#00ffff',
          distance: 150,
          enable: true,
          opacity: 0.3,
          width: 1,
        },
        move: {
          direction: "none" as any, // Type casting to fix TS error
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: true,
          speed: 0.5, // Reduced for better performance
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 40, // Reduced for better performance
        },
        opacity: {
          value: 0.5,
          random: true,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
          random: true,
        },
      },
      detectRetina: true,
    };
  }, [variant]);

  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={getConfig()}
        className="w-full h-full"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default memo(AnimatedBackground); // Use memo to prevent unnecessary re-renders
