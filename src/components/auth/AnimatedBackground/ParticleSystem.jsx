import React, { useEffect, useRef, useMemo } from 'react';

/**
 * Particle class for object pooling
 */
class Particle {
  constructor(canvas, colors) {
    this.reset(canvas, colors);
  }

  reset(canvas, colors) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.opacity = Math.random() * 0.5 + 0.3;
  }

  update(canvas, speedMultiplier = 1) {
    this.x += this.speedX * speedMultiplier;
    this.y += this.speedY * speedMultiplier;

    // Wrap around edges
    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/**
 * ParticleSystem Component
 * Renders animated particles using canvas for optimal performance
 */
const ParticleSystem = ({ count, colors, intensity, parallaxOffset, reduceMotion }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Speed multiplier based on intensity
  const speedMultiplier = useMemo(() => {
    const multipliers = {
      low: 0.5,
      medium: 1,
      high: 1.5
    };
    return multipliers[intensity] || 1;
  }, [intensity]);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particle pool
    particlesRef.current = Array.from(
      { length: count },
      () => new Particle(canvas, colors)
    );

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [count, colors]);

  // Animation loop
  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (currentTime) => {
      // Calculate delta time for smooth animation
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update(canvas, speedMultiplier);
        particle.draw(ctx);
      });

      // Draw connections between nearby particles
      if (count < 50) { // Only draw connections for smaller particle counts
        drawConnections(ctx, particlesRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [count, speedMultiplier, reduceMotion]);

  // Draw connections between nearby particles
  const drawConnections = (ctx, particles) => {
    const maxDistance = 100;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = (1 - distance / maxDistance) * 0.2;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: `translate(${parallaxOffset.x * 0.5}px, ${parallaxOffset.y * 0.5}px)`,
        transition: reduceMotion ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default ParticleSystem;
