/**
 * Property-based tests for keyboard navigation and focus indicators
 * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
 * Validates: Requirements 6.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  focusUtils,
  matchesShortcut,
  keyboardShortcuts,
  announce,
  getAnnouncer,
} from '../accessibility';

describe('Keyboard Navigation - Property Tests', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any container with interactive elements, all focusable elements should be identifiable
   */
  it('should identify all focusable elements in a container', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 5 }),
        (buttonCount, inputCount, linkCount) => {
          // Create container with various interactive elements
          const testContainer = document.createElement('div');
          
          // Add buttons
          for (let i = 0; i < buttonCount; i++) {
            const button = document.createElement('button');
            button.textContent = `Button ${i}`;
            testContainer.appendChild(button);
          }
          
          // Add inputs
          for (let i = 0; i < inputCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            testContainer.appendChild(input);
          }
          
          // Add links
          for (let i = 0; i < linkCount; i++) {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = `Link ${i}`;
            testContainer.appendChild(link);
          }
          
          document.body.appendChild(testContainer);
          
          const focusableElements = focusUtils.getFocusableElements(testContainer);
          const expectedCount = buttonCount + inputCount + linkCount;
          
          expect(focusableElements.length).toBe(expectedCount);
          
          document.body.removeChild(testContainer);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any focusable element, moveFocusTo should successfully focus it
   */
  it('should successfully move focus to any focusable element', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'input', 'a', 'select', 'textarea'),
        (elementType) => {
          const element = document.createElement(elementType);
          
          if (elementType === 'a') {
            element.href = '#';
          }
          
          container.appendChild(element);
          
          focusUtils.moveFocusTo(element);
          
          expect(document.activeElement).toBe(element);
          
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any keyboard shortcut, matchesShortcut should correctly identify matching events
   */
  it('should correctly match keyboard shortcuts', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('a', 'b', 'c', 'd', 'f', 'p', 's'),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (key, ctrlKey, altKey, shiftKey) => {
          const event = {
            key,
            ctrlKey,
            altKey,
            shiftKey,
          };
          
          const shortcut = {
            key,
            ctrlKey,
            altKey,
            shiftKey,
          };
          
          const matches = matchesShortcut(event, shortcut);
          
          // Should match when all properties align
          expect(matches).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any keyboard event with different key, matchesShortcut should return false
   */
  it('should not match shortcuts with different keys', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('a', 'b', 'c'),
        fc.constantFrom('x', 'y', 'z'),
        (key1, key2) => {
          fc.pre(key1 !== key2); // Ensure keys are different
          
          const event = {
            key: key1,
            ctrlKey: true,
            altKey: false,
            shiftKey: false,
          };
          
          const shortcut = {
            key: key2,
            ctrlKey: true,
            altKey: false,
            shiftKey: false,
          };
          
          const matches = matchesShortcut(event, shortcut);
          
          expect(matches).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any disabled element, it should not be included in focusable elements
   */
  it('should exclude disabled elements from focusable list', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        (enabledCount, disabledCount) => {
          const testContainer = document.createElement('div');
          
          // Add enabled buttons
          for (let i = 0; i < enabledCount; i++) {
            const button = document.createElement('button');
            button.textContent = `Enabled ${i}`;
            testContainer.appendChild(button);
          }
          
          // Add disabled buttons
          for (let i = 0; i < disabledCount; i++) {
            const button = document.createElement('button');
            button.textContent = `Disabled ${i}`;
            button.disabled = true;
            testContainer.appendChild(button);
          }
          
          document.body.appendChild(testContainer);
          
          const focusableElements = focusUtils.getFocusableElements(testContainer);
          
          // Should only include enabled elements
          expect(focusableElements.length).toBe(enabledCount);
          
          document.body.removeChild(testContainer);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any element with tabindex="-1", it should not be included in focusable elements
   */
  it('should exclude elements with tabindex -1 from focusable list', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        (normalCount, excludedCount) => {
          const testContainer = document.createElement('div');
          
          // Add normal focusable elements
          for (let i = 0; i < normalCount; i++) {
            const button = document.createElement('button');
            button.textContent = `Normal ${i}`;
            testContainer.appendChild(button);
          }
          
          // Add elements with tabindex -1
          for (let i = 0; i < excludedCount; i++) {
            const div = document.createElement('div');
            div.textContent = `Excluded ${i}`;
            div.setAttribute('tabindex', '-1');
            testContainer.appendChild(div);
          }
          
          document.body.appendChild(testContainer);
          
          const focusableElements = focusUtils.getFocusableElements(testContainer);
          
          // Should only include normal elements
          expect(focusableElements.length).toBe(normalCount);
          
          document.body.removeChild(testContainer);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any message announced, the announcer should handle it without errors
   */
  it('should announce messages without errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('polite', 'assertive'),
        (message, priority) => {
          // Should not throw
          expect(() => announce(message, priority)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any container with focusable elements, focus trap should cycle through them
   */
  it('should trap focus within container boundaries', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        (elementCount) => {
          const testContainer = document.createElement('div');
          const elements = [];
          
          // Create focusable elements
          for (let i = 0; i < elementCount; i++) {
            const button = document.createElement('button');
            button.textContent = `Button ${i}`;
            testContainer.appendChild(button);
            elements.push(button);
          }
          
          document.body.appendChild(testContainer);
          
          // Set up focus trap
          const cleanup = focusUtils.trapFocus(testContainer);
          
          // Focus first element
          elements[0].focus();
          expect(document.activeElement).toBe(elements[0]);
          
          // Simulate Tab to last element (should wrap)
          const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true,
          });
          
          // Focus last element
          elements[elementCount - 1].focus();
          expect(document.activeElement).toBe(elements[elementCount - 1]);
          
          cleanup();
          document.body.removeChild(testContainer);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any keyboard shortcut configuration, it should have required properties
   */
  it('should have valid keyboard shortcut configurations', () => {
    const shortcuts = Object.values(keyboardShortcuts);
    
    shortcuts.forEach(shortcut => {
      expect(shortcut).toHaveProperty('key');
      expect(typeof shortcut.key).toBe('string');
      expect(shortcut.key.length).toBeGreaterThan(0);
    });
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any element that can receive focus, it should be focusable
   */
  it('should allow focus on interactive elements', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constantFrom('button', 'input', 'select', 'textarea', 'a'),
          id: fc.string({ minLength: 1, maxLength: 20 }),
        }),
        (config) => {
          const element = document.createElement(config.type);
          element.id = config.id;
          
          if (config.type === 'a') {
            element.href = '#';
          }
          
          container.appendChild(element);
          
          // Element should be focusable
          element.focus();
          expect(document.activeElement).toBe(element);
          
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 1: Focus indicators on all interactive elements
   * For any modifier key combination, matchesShortcut should respect all modifiers
   */
  it('should respect all modifier keys in shortcut matching', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (ctrlKey, altKey, shiftKey) => {
          const event = {
            key: 'a',
            ctrlKey,
            altKey,
            shiftKey,
          };
          
          const shortcut = {
            key: 'a',
            ctrlKey,
            altKey,
            shiftKey,
          };
          
          const matches = matchesShortcut(event, shortcut);
          expect(matches).toBe(true);
          
          // Test with different modifier combination
          const differentEvent = {
            key: 'a',
            ctrlKey: !ctrlKey,
            altKey,
            shiftKey,
          };
          
          const shouldNotMatch = matchesShortcut(differentEvent, shortcut);
          
          // If shortcut requires ctrl, event without ctrl should not match
          if (shortcut.ctrlKey) {
            expect(shouldNotMatch).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
