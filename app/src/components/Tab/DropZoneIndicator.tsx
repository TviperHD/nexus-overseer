import React, { useState, useEffect, useRef } from 'react';
import { useTabStore } from '@/stores/tabStore';
import type { DropZoneType } from '@/types/tabDrag';
import { calculateEdgeLineDimensions, calculateDropZoneDimensions } from '@/utils/dropZoneCalculator';

/**
 * DropZoneIndicator component
 * Renders a visual indicator showing where a tab will be dropped
 * - Initially shows just an edge highlight
 * - After 2 seconds, expands to show full preview
 */
export const DropZoneIndicator: React.FC = () => {
  const activeDropZone = useTabStore((state) => state.activeDropZone);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDropZoneRef = useRef<string | null>(null);

  // Create a stable key for the drop zone to use as dependency
  const dropZoneKey = activeDropZone && activeDropZone.type !== 'tab-bar'
    ? `${activeDropZone.type}-${activeDropZone.targetPanelId || 'empty'}`
    : null;

  // Handle drop zone changes and timer management
  // Only depend on dropZoneKey, not the entire activeDropZone object
  // This prevents the effect from running when the object reference changes but values are the same
  useEffect(() => {
    // Don't show indicator for tab-bar type or when no drop zone
    if (!dropZoneKey) {
      // Clear timer if drop zone is cleared
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShowFullPreview(false);
      prevDropZoneRef.current = null;
      return;
    }

    // If drop zone changed, reset to edge line only
    if (dropZoneKey !== prevDropZoneRef.current) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      setShowFullPreview(false);
      prevDropZoneRef.current = dropZoneKey;
      
      // Start new timer for 1 second
      timerRef.current = setTimeout(() => {
        setShowFullPreview(true);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [dropZoneKey]); // Only depend on the key string, not the object

  // Don't show indicator for tab-bar type (handled by TabBar component)
  if (!activeDropZone || activeDropZone.type === 'tab-bar') {
    return null;
  }

  const { type, position, targetPanelId } = activeDropZone;

  // Get the panel element to calculate edge line
  let edgeLineDimensions = position;
  let fullPreviewDimensions = position;
  
  if (type !== 'empty-canvas' && targetPanelId) {
    const panelElement = document.querySelector(`[data-panel-id="${targetPanelId}"]`) as HTMLElement;
    if (panelElement) {
      const panelRect = panelElement.getBoundingClientRect();
      edgeLineDimensions = calculateEdgeLineDimensions(type, panelRect, 35, 3);
      fullPreviewDimensions = calculateDropZoneDimensions(type, panelRect, 30, 35);
    }
  }

  // Use edge line initially, full preview after 2 seconds
  const displayDimensions = showFullPreview ? fullPreviewDimensions : edgeLineDimensions;
  const isEdgeLine = !showFullPreview && type !== 'empty-canvas';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${displayDimensions.x}px`,
        top: `${displayDimensions.y}px`,
        width: `${displayDimensions.width}px`,
        height: `${displayDimensions.height}px`,
        border: isEdgeLine ? 'none' : '2px solid #007acc',
        backgroundColor: isEdgeLine 
          ? '#007acc' // Solid color for edge line
          : 'rgba(0, 122, 204, 0.1)', // Semi-transparent for full preview
        pointerEvents: 'none',
        zIndex: 9999, // High but below modals/dropdowns (which are typically 10000+)
        borderRadius: isEdgeLine ? '0' : '2px',
        transition: showFullPreview 
          ? 'all 0.3s ease-out' // Smooth expansion
          : 'opacity 0.2s ease-in-out',
        boxShadow: isEdgeLine 
          ? '0 0 4px rgba(0, 122, 204, 0.5)' // Subtle glow for edge line
          : '0 0 10px rgba(0, 122, 204, 0.5)', // More prominent for preview
      }}
    />
  );
};

