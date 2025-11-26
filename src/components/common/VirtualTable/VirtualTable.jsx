import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

/**
 * VirtualTable Component
 * Implements virtual scrolling for large datasets to improve performance
 * Only renders visible rows plus a buffer
 * 
 * @param {Array} data - Array of data items
 * @param {Function} renderRow - Function to render each row (item, index) => ReactNode
 * @param {Function} renderHeader - Function to render table header
 * @param {number} rowHeight - Height of each row in pixels (default: 60)
 * @param {number} overscan - Number of extra rows to render above/below viewport (default: 5)
 * @param {Object} containerProps - Props to pass to TableContainer
 */
const VirtualTable = ({
  data = [],
  renderRow,
  renderHeader,
  rowHeight = 60,
  overscan = 5,
  containerProps = {},
  ...tableProps
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Calculate visible range
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / rowHeight);
    const end = Math.min(data.length, start + visibleCount + overscan * 2);
    const offset = start * rowHeight;

    return {
      startIndex: start,
      endIndex: end,
      offsetY: offset,
    };
  }, [scrollTop, containerHeight, rowHeight, overscan, data.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Total height of all rows
  const totalHeight = data.length * rowHeight;

  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Update container height on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <TableContainer
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        maxHeight: 600,
        overflow: 'auto',
        ...containerProps.sx,
      }}
      {...containerProps}
    >
      <Table {...tableProps}>
        {renderHeader && (
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'background.paper',
              zIndex: 1,
            }}
          >
            {renderHeader()}
          </TableHead>
        )}
        <TableBody>
          {/* Spacer for rows before visible range */}
          {offsetY > 0 && (
            <TableRow>
              <TableCell
                colSpan={100}
                sx={{ height: offsetY, padding: 0, border: 'none' }}
              />
            </TableRow>
          )}

          {/* Visible rows */}
          {visibleItems.map((item, index) => 
            renderRow(item, startIndex + index)
          )}

          {/* Spacer for rows after visible range */}
          {endIndex < data.length && (
            <TableRow>
              <TableCell
                colSpan={100}
                sx={{
                  height: totalHeight - (endIndex * rowHeight),
                  padding: 0,
                  border: 'none',
                }}
              />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VirtualTable;
