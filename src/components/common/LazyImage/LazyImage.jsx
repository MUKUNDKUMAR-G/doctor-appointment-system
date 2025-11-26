import { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * LazyImage component with intersection observer for lazy loading
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {object} sx - MUI sx prop for styling
 * @param {string} placeholder - Placeholder type: 'skeleton' | 'blur'
 * @param {object} ...props - Additional props passed to the img element
 */
const LazyImage = ({ 
  src, 
  alt, 
  sx = {}, 
  placeholder = 'skeleton',
  width,
  height,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Box
      ref={imgRef}
      sx={{
        position: 'relative',
        width: width || '100%',
        height: height || '100%',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* Show skeleton while loading */}
      {!isLoaded && placeholder === 'skeleton' && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}

      {/* Load image only when in view */}
      {isInView && (
        <Box
          component="img"
          src={src}
          alt={alt}
          onLoad={handleLoad}
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          {...props}
        />
      )}
    </Box>
  );
};

export default LazyImage;
