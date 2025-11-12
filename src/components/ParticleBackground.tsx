import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface ParticleBackgroundProps {
  variant?: 'subtle' | 'snow' | 'minimal';
}

export const ParticleBackground = ({ variant = 'subtle' }: ParticleBackgroundProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const getConfig = () => {
    switch (variant) {
      case 'snow':
        return {
          particles: {
            number: { 
              value: 50, 
              density: { 
                enable: true, 
                area: 800 
              } 
            },
            color: { value: ["#60A5FA", "#93C5FD", "#DBEAFE"] },
            opacity: {
              value: 0.6,
              random: true,
              animation: { 
                enable: true, 
                speed: 0.5, 
                minimumValue: 0.2, 
                sync: false 
              }
            },
            size: {
              value: 4,
              random: true,
              animation: { 
                enable: true, 
                speed: 2, 
                minimumValue: 1, 
                sync: false 
              }
            },
            move: {
              enable: true,
              speed: 2,
              direction: "bottom" as const,
              random: true,
              straight: false,
              outModes: "out" as const,
              bounce: false,
            }
          },
          interactivity: {
            detectsOn: "window" as const,
            events: {
              onHover: { enable: false },
              onClick: { enable: false },
              resize: true
            }
          },
          detectRetina: true
        };

      case 'minimal':
        return {
          particles: {
            number: { 
              value: 20, 
              density: { 
                enable: true, 
                area: 1000 
              } 
            },
            color: { value: "#5D6BA3" },
            opacity: {
              value: 0.15,
              random: true,
              animation: { 
                enable: true, 
                speed: 0.3, 
                minimumValue: 0.05, 
                sync: false 
              }
            },
            size: {
              value: 2,
              random: true,
            },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none" as const,
              random: true,
              straight: false,
              outModes: "bounce" as const,
            }
          },
          interactivity: {
            detectsOn: "window" as const,
            events: {
              onHover: { enable: false },
              onClick: { enable: false },
              resize: true
            }
          },
          detectRetina: true
        };

      default: // subtle
        return {
          particles: {
            number: { 
              value: 15, 
              density: { 
                enable: true, 
                area: 1200 
              } 
            },
            color: { value: "#2D3561" },
            opacity: {
              value: 0.1,
              random: true,
              animation: { 
                enable: true, 
                speed: 0.2, 
                minimumValue: 0.03, 
                sync: false 
              }
            },
            size: {
              value: 1.5,
              random: true,
            },
            move: {
              enable: true,
              speed: 0.3,
              direction: "none" as const,
              random: true,
              straight: false,
              outModes: "bounce" as const,
            }
          },
          interactivity: {
            detectsOn: "window" as const,
            events: {
              onHover: { enable: false },
              onClick: { enable: false },
              resize: true
            }
          },
          detectRetina: true
        };
    }
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={getConfig()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};
