import { renderHook, act } from '@testing-library/react';
import { LoadingProvider } from '../contexts/LoadingContext';
import useLoadingCoordinator from './useLoadingCoordinator';

// Test wrapper with LoadingProvider
const createWrapper = () => {
  return ({ children }) => (
    <LoadingProvider>
      {children}
    </LoadingProvider>
  );
};

describe('useLoadingCoordinator', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should manage loading states with deduplication', () => {
    const { result } = renderHook(() => useLoadingCoordinator(), {
      wrapper: createWrapper()
    });

    // Start loading for the same key multiple times
    act(() => {
      result.current.setLoading('test-key', true);
      result.current.setLoading('test-key', true);
      result.current.setLoading('test-key', true);
    });

    // Should be loading
    expect(result.current.isLoading('test-key')).toBe(false); // Still debounced

    // Fast-forward past debounce delay
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current.isLoading('test-key')).toBe(true);

    // Stop loading the same number of times
    act(() => {
      result.current.setLoading('test-key', false);
      result.current.setLoading('test-key', false);
    });

    // Should still be loading (one request remaining)
    expect(result.current.isLoading('test-key')).toBe(true);

    // Stop the last request
    act(() => {
      result.current.setLoading('test-key', false);
    });

    // Fast-forward past minimum duration
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(result.current.isLoading('test-key')).toBe(false);
  });

  test('should handle withLoadingCoordination wrapper', async () => {
    const { result } = renderHook(() => useLoadingCoordinator({
      debounceDelay: 0,
      minLoadingDuration: 0
    }), {
      wrapper: createWrapper()
    });

    const mockAsyncOperation = jest.fn().mockResolvedValue('test-result');

    let loadingPromise;
    act(() => {
      loadingPromise = result.current.withLoadingCoordination('test-operation', mockAsyncOperation);
    });

    // Should be loading immediately (no debounce)
    expect(result.current.isLoading('test-operation')).toBe(true);

    // Wait for operation to complete
    const resultValue = await loadingPromise;

    // Should not be loading after completion
    expect(result.current.isLoading('test-operation')).toBe(false);
    expect(resultValue).toBe('test-result');
    expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
  });

  test('should create scoped coordinators', () => {
    const { result } = renderHook(() => useLoadingCoordinator({
      debounceDelay: 0,
      minLoadingDuration: 0
    }), {
      wrapper: createWrapper()
    });

    const coordinator = result.current.createCoordinator('appointments');

    act(() => {
      coordinator.setLoading('fetch', true);
    });

    expect(coordinator.isLoading('fetch')).toBe(true);
    expect(result.current.isLoading('appointments.fetch')).toBe(true);

    act(() => {
      coordinator.setLoading('fetch', false);
    });

    expect(coordinator.isLoading('fetch')).toBe(false);
    expect(result.current.isLoading('appointments.fetch')).toBe(false);
  });

  test('should provide loading statistics', () => {
    const { result } = renderHook(() => useLoadingCoordinator({
      debounceDelay: 0
    }), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.setLoading('op1', true, { priority: 'high' });
      result.current.setLoading('op2', true, { priority: 'normal' });
      result.current.setLoading('op1', true); // Duplicate request
    });

    const stats = result.current.getLoadingStats();
    expect(stats.activeOperations).toBe(2);
    expect(stats.totalRequests).toBe(3);
    expect(stats.operationsByPriority.high).toBe(1);
    expect(stats.operationsByPriority.normal).toBe(1);
  });

  test('should force stop loading', () => {
    const { result } = renderHook(() => useLoadingCoordinator({
      debounceDelay: 0,
      minLoadingDuration: 1000
    }), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.setLoading('test-key', true);
    });

    expect(result.current.isLoading('test-key')).toBe(true);

    act(() => {
      result.current.setLoading('test-key', false);
    });

    // Should still be loading due to minimum duration
    expect(result.current.isLoading('test-key')).toBe(true);

    act(() => {
      result.current.forceStopLoading('test-key');
    });

    // Should stop immediately
    expect(result.current.isLoading('test-key')).toBe(false);
  });

  test('should clear all loading states', () => {
    const { result } = renderHook(() => useLoadingCoordinator({
      debounceDelay: 0
    }), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.setLoading('op1', true);
      result.current.setLoading('op2', true);
      result.current.setLoading('op3', true);
    });

    expect(result.current.getLoadingOperations()).toHaveLength(3);

    act(() => {
      result.current.clearAllLoading();
    });

    expect(result.current.getLoadingOperations()).toHaveLength(0);
    expect(result.current.isLoading()).toBe(false);
  });
});