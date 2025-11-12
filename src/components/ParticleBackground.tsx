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
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: ["#60A5FA", "#93C5FD", "#DBEAFE"] }, // Blue shades for contrast
            opacity: {
              value: 0.6,
              random: true,
              anim: { enable: true, speed: 0.5, opacity_min: 0.2, sync: false }
            },
            size: {
              value: 4,
              random: true,
              anim: { enable: true, speed: 2, size_min: 1, sync: false }
            },
            move: {
              enable: true,
              speed: 2,
              direction: "bottom" as const,
              random: true,
              straight: false,
              out_mode: "out" as const,
              bounce: false,
            },
            wobble: {
              enable: true,
              distance: 10,
              speed: 10
            }
          },
          interactivity: {
            detect_on: "canvas" as const,
            events: {
              onhover: { enable: false },
              onclick: { enable: false },
              resize: true
            }
          },
          retina_detect: true
        };

      case 'minimal':
        return {
          particles: {
            number: { value: 20, density: { enable: true, value_area: 1000 } },
            color: { value: "#5D6BA3" },
            opacity: {
              value: 0.15,
              random: true,
              anim: { enable: true, speed: 0.3, opacity_min: 0.05, sync: false }
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
              out_mode: "bounce" as const,
            }
          },
          interactivity: {
            detect_on: "canvas" as const,
            events: {
              onhover: { enable: false },
              onclick: { enable: false },
              resize: true
            }
          },
          retina_detect: true
        };

      default: // subtle
        return {
          particles: {
            number: { value: 15, density: { enable: true, value_area: 1200 } },
            color: { value: "#2D3561" },
            opacity: {
              value: 0.1,
              random: true,
              anim: { enable: true, speed: 0.2, opacity_min: 0.03, sync: false }
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
              out_mode: "bounce" as const,
            }
          },
          interactivity: {
            detect_on: "canvas" as const,
            events: {
              onhover: { enable: false },
              onclick: { enable: false },
              resize: true
            }
          },
          retina_detect: true
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
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};
