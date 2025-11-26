import { useState, useCallback } from 'react';

/**
 * Hook for managing bulk operations on selected items
 * Provides selection management and bulk action execution
 * 
 * @returns {Object} Selection state and bulk action functions
 */
export const useBulkActions = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(null);

  // Select a single item
  const selectItem = useCallback((id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  // Deselect a single item
  const deselectItem = useCallback((id) => {
    setSelectedItems(prev => prev.filter(item => item !== id));
  }, []);

  // Toggle item selection
  const toggleItem = useCallback((id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  }, []);

  // Select all items
  const selectAll = useCallback((ids) => {
    setSelectedItems(ids);
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Check if an item is selected
  const isSelected = useCallback((id) => {
    return selectedItems.includes(id);
  }, [selectedItems]);

  // Check if all items are selected
  const areAllSelected = useCallback((ids) => {
    if (!ids || ids.length === 0) return false;
    return ids.every(id => selectedItems.includes(id));
  }, [selectedItems]);

  // Check if some (but not all) items are selected
  const areSomeSelected = useCallback((ids) => {
    if (!ids || ids.length === 0) return false;
    const selectedCount = ids.filter(id => selectedItems.includes(id)).length;
    return selectedCount > 0 && selectedCount < ids.length;
  }, [selectedItems]);

  // Toggle all items
  const toggleAll = useCallback((ids) => {
    if (areAllSelected(ids)) {
      // Deselect all
      setSelectedItems(prev => prev.filter(id => !ids.includes(id)));
    } else {
      // Select all
      setSelectedItems(prev => {
        const newIds = ids.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  }, [areAllSelected]);

  /**
   * Execute a bulk action on selected items
   * @param {Function} action - Async function that performs the bulk action
   * @param {Array} items - Optional array of items (defaults to selectedItems)
   * @param {Object} options - Options for execution
   * @param {boolean} options.clearOnSuccess - Clear selection after successful execution
   * @param {Function} options.onProgress - Callback for progress updates
   * @returns {Object} Result with success/failure counts and errors
   */
  const executeBulkAction = useCallback(async (action, items = null, options = {}) => {
    const {
      clearOnSuccess = true,
      onProgress = null,
    } = options;

    const itemsToProcess = items || selectedItems;
    
    if (itemsToProcess.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        errors: [],
      };
    }

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: itemsToProcess.length });

    try {
      const result = await action(itemsToProcess);
      
      // Update progress
      if (onProgress) {
        onProgress(itemsToProcess.length, itemsToProcess.length);
      }
      
      setProcessingProgress({ current: itemsToProcess.length, total: itemsToProcess.length });

      // Clear selection on success if requested
      if (clearOnSuccess && result.successCount > 0) {
        clearSelection();
      }

      return result;
    } catch (error) {
      console.error('Bulk action failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  }, [selectedItems, clearSelection]);

  /**
   * Execute a bulk action with individual item processing
   * Useful for operations that need to process items one by one
   * @param {Function} actionFn - Function that processes a single item
   * @param {Array} items - Optional array of items (defaults to selectedItems)
   * @param {Object} options - Options for execution
   * @returns {Object} Result with success/failure counts and errors
   */
  const executeBulkActionIndividually = useCallback(async (actionFn, items = null, options = {}) => {
    const {
      clearOnSuccess = true,
      onProgress = null,
      continueOnError = true,
    } = options;

    const itemsToProcess = items || selectedItems;
    
    if (itemsToProcess.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        errors: [],
      };
    }

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: itemsToProcess.length });

    const results = {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      
      try {
        await actionFn(item);
        results.successCount++;
      } catch (error) {
        results.failureCount++;
        results.errors.push({
          itemId: item,
          error: error.message || 'Unknown error',
        });

        if (!continueOnError) {
          break;
        }
      }

      // Update progress
      const current = i + 1;
      setProcessingProgress({ current, total: itemsToProcess.length });
      
      if (onProgress) {
        onProgress(current, itemsToProcess.length);
      }
    }

    setIsProcessing(false);
    setProcessingProgress(null);

    // Clear selection on success if requested
    if (clearOnSuccess && results.successCount > 0) {
      clearSelection();
    }

    return results;
  }, [selectedItems, clearSelection]);

  return {
    selectedItems,
    selectedCount: selectedItems.length,
    isProcessing,
    processingProgress,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    areAllSelected,
    areSomeSelected,
    toggleAll,
    executeBulkAction,
    executeBulkActionIndividually,
  };
};

export default useBulkActions;
