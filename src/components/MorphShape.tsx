import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MorphShapeProps {
  variant?: 'circle' | 'blob' | 'wave';
  color?: string;
  size?: number;
  duration?: number;
}

export const MorphShape = ({ 
  variant = 'blob', 
  color = '#5D6BA3', 
  size = 100,
  duration = 8
}: MorphShapeProps) => {
  const [pathIndex, setPathIndex] = useState(0);

  const blobPaths = [
    "M60,-65.7C75.9,-54.3,85.7,-32.4,87.3,-9.8C88.9,12.8,82.2,36.2,68.9,51.3C55.6,66.4,35.6,73.2,15.3,75.9C-5,78.6,-25.6,77.2,-41.8,66.7C-58,56.2,-69.8,36.6,-73.2,15.7C-76.6,-5.2,-71.6,-27.4,-59.8,-42.3C-48,-57.2,-29.4,-64.8,-9.2,-67.8C11,-70.8,44.1,-77.1,60,-65.7Z",
    "M51.4,-58.5C66.6,-49.4,78.5,-31.4,82.3,-11.5C86.1,8.4,81.8,30.2,70.1,46.8C58.4,63.4,39.3,74.8,18.9,79.1C-1.5,83.4,-23.2,80.6,-40.8,71.2C-58.4,61.8,-71.9,45.8,-77.3,27.3C-82.7,8.8,-80,-12.2,-71.1,-29.5C-62.2,-46.8,-47.1,-60.4,-30.4,-69.1C-13.7,-77.8,5.6,-81.6,23.4,-77.2C41.2,-72.8,36.2,-67.6,51.4,-58.5Z",
    "M44.3,-54.2C57.1,-43.5,67.1,-28.5,70.8,-11.9C74.5,4.7,71.9,22.9,63.3,37.6C54.7,52.3,40.1,63.5,23.8,68.9C7.5,74.3,-10.5,73.9,-26.4,67.7C-42.3,61.5,-56.1,49.5,-64.3,34.3C-72.5,19.1,-75.1,0.7,-71.9,-16.2C-68.7,-33.1,-59.7,-48.5,-46.8,-59.1C-33.9,-69.7,-16.9,-75.5,-0.7,-74.6C15.5,-73.7,31.5,-64.9,44.3,-54.2Z",
  ];

  const circlePath = "M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0 Z";
  
  const wavePaths = [
    "M0,50 Q25,20 50,50 T100,50 V100 H0 Z",
    "M0,50 Q25,80 50,50 T100,50 V100 H0 Z",
    "M0,50 Q25,40 50,50 T100,50 V100 H0 Z",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPathIndex((prev) => (prev + 1) % 3);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [duration]);

  const getPaths = () => {
    switch (variant) {
      case 'circle':
        return [circlePath, circlePath, circlePath];
      case 'wave':
        return wavePaths;
      default:
        return blobPaths;
    }
  };

  const paths = getPaths();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ overflow: 'visible' }}
    >
      <motion.path
        d={paths[pathIndex]}
        fill={color}
        initial={{ d: paths[0] }}
        animate={{ d: paths[pathIndex] }}
        transition={{
          duration: duration,
          ease: "easeInOut",
          repeat: 0,
        }}
        style={{
          transformOrigin: 'center',
          transform: 'translate(50%, 50%)',
        }}
      />
    </svg>
  );
};
