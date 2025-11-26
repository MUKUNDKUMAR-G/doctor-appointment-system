import React, { useState } from 'react';
import {
  AnimatedWrapper,
  AnimatedList,
  InteractiveButton,
  InteractiveCard,
  InteractiveIconButton,
  SmoothTransition,
} from '../common';
import {
  fadeIn,
  slideUp,
  scaleIn,
  staggerContainer,
  staggerItem,
} from '../../theme/animations';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

/**
 * AnimationShowcase Component
 * Demonstrates all animation utilities and micro-interactions
 * This is an example component for reference
 */
const AnimationShowcase = () => {
  const [showTransition, setShowTransition] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const sampleItems = [
    { id: 1, title: 'Item 1', description: 'First item' },
    { id: 2, title: 'Item 2', description: 'Second item' },
    { id: 3, title: 'Item 3', description: 'Third item' },
    { id: 4, title: 'Item 4', description: 'Fourth item' },
  ];

  const handleButtonClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Animation System Showcase</h1>

      {/* Section 1: Basic Animations */}
      <section style={{ marginBottom: '60px' }}>
        <h2>Basic Animations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <AnimatedWrapper variants={fadeIn}>
            <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
              Fade In
            </div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={slideUp}>
            <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
              Slide Up
            </div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={scaleIn}>
            <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
              Scale In
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      {/* Section 2: Interactive Buttons */}
      <section style={{ marginBottom: '60px' }}>
        <h2>Interactive Buttons</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <InteractiveButton variant="primary" onClick={handleButtonClick} loading={isLoading}>
            Primary Button
          </InteractiveButton>

          <InteractiveButton variant="secondary">Secondary Button</InteractiveButton>

          <InteractiveButton variant="outline">Outline Button</InteractiveButton>

          <InteractiveButton variant="ghost">Ghost Button</InteractiveButton>

          <InteractiveButton variant="primary" size="small">
            Small
          </InteractiveButton>

          <InteractiveButton variant="primary" size="large">
            Large
          </InteractiveButton>
        </div>
      </section>

      {/* Section 3: Interactive Cards */}
      <section style={{ marginBottom: '60px' }}>
        <h2>Interactive Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <InteractiveCard variant="default" hoverEffect="lift">
            <h3>Lift Effect</h3>
            <p>Hover to see the lift effect</p>
          </InteractiveCard>

          <InteractiveCard variant="glass" hoverEffect="glow">
            <h3>Glow Effect</h3>
            <p>Hover to see the glow effect</p>
          </InteractiveCard>

          <InteractiveCard variant="elevated" hoverEffect="scale">
            <h3>Scale Effect</h3>
            <p>Hover to see the scale effect</p>
          </InteractiveCard>
        </div>
      </section>

      {/* Section 4: Icon Buttons */}
      <section style={{ marginBottom: '60px' }}>
        <h2>Interactive Icon Buttons</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <InteractiveIconButton
            icon={<span>❤️</span>}
            variant="primary"
            ariaLabel="Like"
            tooltip="Add to favorites"
          />

          <InteractiveIconButton
            icon={<span>⭐</span>}
            variant="default"
            ariaLabel="Star"
            tooltip="Add star"
          />

          <InteractiveIconButton
            icon={<span>🗑️</span>}
            variant="danger"
            ariaLabel="Delete"
            tooltip="Delete item"
          />

          <InteractiveIconButton
            icon={<span>✏️</span>}
            variant="ghost"
            ariaLabel="Edit"
            tooltip="Edit item"
          />
        </div>
      </section>

      {/* Section 5: Staggered List */}
      <section style={{ marginBottom: '60px' }}>
        <h2>Staggered List Animation</h2>
        <AnimatedList speed="normal" itemVariant="default">
          {sampleItems.map((item) => (
            <InteractiveCard
              key={item.id}
              variant="default"
              hoverEffect="lift"
              style={{ marginBottom: '12px' }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>{item.title}</h4>
              <p style={{ margin: 0, color: '#6b7280' }}>{item.description}</p>
            </InteractiveCard>
          ))}
        </AnimatedList>
      </section>

      {/* Section 6: Smooth Transition */}
      <section style={{ marginBottom: '60px' }}>
        <h2>Smooth Transition</h2>
        <InteractiveButton onClick={() => setShowTransition(!showTransition)}>
          Toggle Transition
        </InteractiveButton>
        <div style={{ marginTop: '20px' }}>
          <SmoothTransition show={showTransition} animation="slideUp">
            <InteractiveCard variant="glass" padding="large">
              <h3>Transitioning Content</h3>
              <p>This content smoothly transitions in and out</p>
            </InteractiveCard>
          </SmoothTransition>
        </div>
      </section>

      {/* Section 7: Scroll Animation */}
      <section style={{ marginBottom: '60px' }}>
        <h2>Scroll-Triggered Animation</h2>
        <div style={{ height: '400px' }} />
        <AnimatedWrapper
          ref={ref}
          variants={slideUp}
          animateOnScroll={true}
          scrollOptions={{ threshold: 0.3 }}
        >
          <InteractiveCard variant="elevated" padding="large">
            <h3>Scroll Down to See This Animate</h3>
            <p>This card animates when it enters the viewport</p>
            <p>Visible: {isVisible ? 'Yes' : 'No'}</p>
          </InteractiveCard>
        </AnimatedWrapper>
      </section>

      {/* Section 8: CSS Classes */}
      <section style={{ marginBottom: '60px' }}>
        <h2>CSS Animation Classes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div className="animate-fade-in" style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
            CSS Fade In
          </div>

          <div className="hover-lift" style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
            Hover Lift
          </div>

          <div className="hover-glow" style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
            Hover Glow
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnimationShowcase;
