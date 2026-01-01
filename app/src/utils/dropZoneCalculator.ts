/**
 * Drop zone calculator utility
 * Calculates drop zones for tab dragging based on mouse position
 */

import type { DropZoneType } from '@/types/tabDrag';

/**
 * Calculate which drop zone the mouse is in
 * @param mouseX - Mouse X coordinate
 * @param mouseY - Mouse Y coordinate
 * @param elementRect - Bounding rectangle of the target element
 * @param snapThreshold - Distance threshold for edge detection (default: 20px)
 * @returns Drop zone type or null if not in any zone
 */
export function calculateDropZone(
  mouseX: number,
  mouseY: number,
  elementRect: DOMRect,
  snapThreshold: number = 20
): DropZoneType | null {
  // Exclude tab bar area from top edge detection (tab bar is ~35px tall)
  // We want to detect the top edge of the content area, not the tab bar
  const TAB_BAR_HEIGHT = 35;
  const contentTop = elementRect.top + TAB_BAR_HEIGHT;
  const contentBottom = elementRect.bottom;
  const contentLeft = elementRect.left;
  const contentRight = elementRect.right;
  
  // Calculate distances to each edge
  // For top/bottom: use content area (exclude tab bar)
  // For left/right: use full panel width
  // Allow detection even if slightly outside bounds (within threshold) for window edges
  const distFromTop = mouseY >= contentTop ? mouseY - contentTop : 
                      (mouseY < contentTop && mouseY >= contentTop - snapThreshold) ? contentTop - mouseY : Infinity;
  const distFromBottom = mouseY <= contentBottom ? contentBottom - mouseY : 
                         (mouseY > contentBottom && mouseY <= contentBottom + snapThreshold) ? mouseY - contentBottom : Infinity;
  const distFromLeft = mouseX >= contentLeft ? mouseX - contentLeft : 
                       (mouseX < contentLeft && mouseX >= contentLeft - snapThreshold) ? contentLeft - mouseX : Infinity;
  const distFromRight = mouseX <= contentRight ? contentRight - mouseX : 
                        (mouseX > contentRight && mouseX <= contentRight + snapThreshold) ? mouseX - contentRight : Infinity;
  
  // Check if mouse is within the panel's overall bounds OR near an edge (within threshold)
  // This allows edge detection at window edges where mouse might be slightly outside
  const isWithinPanelBounds = 
    mouseX >= elementRect.left && 
    mouseX <= elementRect.right && 
    mouseY >= elementRect.top && 
    mouseY <= elementRect.bottom;
  
  const isNearAnyEdge = distFromTop <= snapThreshold || 
                        distFromBottom <= snapThreshold || 
                        distFromLeft <= snapThreshold || 
                        distFromRight <= snapThreshold;
  
  // Only proceed if mouse is within bounds OR near an edge
  if (!isWithinPanelBounds && !isNearAnyEdge) {
    return null;
  }
  
  // Check if panel edges are at window edges
  // This helps detect edges even when mouse is at the very edge of the window
  const isAtWindowLeft = elementRect.left <= 5; // Within 5px of window left edge
  const isAtWindowRight = elementRect.right >= window.innerWidth - 5; // Within 5px of window right edge
  const isAtWindowTop = elementRect.top <= 5; // Within 5px of window top edge
  const isAtWindowBottom = elementRect.bottom >= window.innerHeight - 5; // Within 5px of window bottom edge
  
  // Check if mouse is within threshold of each edge
  // For horizontal edges (top/bottom), also check that mouse is within horizontal bounds (with margin for window edges)
  // For vertical edges (left/right), also check that mouse is within vertical bounds (below tab bar, with margin)
  // Allow larger margin when panel is at window edge
  const horizontalMargin = isAtWindowLeft || isAtWindowRight ? snapThreshold * 2 : snapThreshold;
  const verticalMargin = isAtWindowTop || isAtWindowBottom ? snapThreshold * 2 : snapThreshold;
  
  // For window edges, be more lenient with detection
  const isNearTop = distFromTop <= snapThreshold && 
                     mouseX >= (isAtWindowLeft ? -horizontalMargin : contentLeft - horizontalMargin) && 
                     mouseX <= (isAtWindowRight ? window.innerWidth + horizontalMargin : contentRight + horizontalMargin) &&
                     mouseY >= (isAtWindowTop ? -verticalMargin : contentTop - verticalMargin);
  
  const isNearBottom = distFromBottom <= snapThreshold && 
                        mouseX >= (isAtWindowLeft ? -horizontalMargin : contentLeft - horizontalMargin) && 
                        mouseX <= (isAtWindowRight ? window.innerWidth + horizontalMargin : contentRight + horizontalMargin) &&
                        mouseY <= (isAtWindowBottom ? window.innerHeight + verticalMargin : contentBottom + verticalMargin);
  
  const isNearLeft = distFromLeft <= snapThreshold && 
                      mouseY >= (isAtWindowTop ? -verticalMargin : contentTop - verticalMargin) &&
                      mouseY <= (isAtWindowBottom ? window.innerHeight + verticalMargin : contentBottom + verticalMargin) &&
                      mouseX >= (isAtWindowLeft ? -horizontalMargin : contentLeft - horizontalMargin);
  
  const isNearRight = distFromRight <= snapThreshold && 
                       mouseY >= (isAtWindowTop ? -verticalMargin : contentTop - verticalMargin) &&
                       mouseY <= (isAtWindowBottom ? window.innerHeight + verticalMargin : contentBottom + verticalMargin) &&
                       mouseX <= (isAtWindowRight ? window.innerWidth + horizontalMargin : contentRight + horizontalMargin);
  
  // If not near any edge, return null
  if (!isNearTop && !isNearBottom && !isNearLeft && !isNearRight) {
    return null;
  }
  
  // If near multiple edges (corner case), pick the closest one
  // Only consider edges that are actually within threshold
  const candidates: Array<{ edge: DropZoneType; dist: number }> = [];
  if (isNearTop) candidates.push({ edge: 'top', dist: distFromTop });
  if (isNearBottom) candidates.push({ edge: 'bottom', dist: distFromBottom });
  if (isNearLeft) candidates.push({ edge: 'left', dist: distFromLeft });
  if (isNearRight) candidates.push({ edge: 'right', dist: distFromRight });
  
  // Find the edge with minimum distance
  if (candidates.length === 0) return null;
  
  const closest = candidates.reduce((min, candidate) => 
    candidate.dist < min.dist ? candidate : min
  );
  
  return closest.edge;
}

/**
 * Calculate drop zone dimensions
 * @param zoneType - Type of drop zone
 * @param targetRect - Bounding rectangle of the target element
 * @param defaultSize - Default size percentage (default: 50%)
 * @param tabBarHeight - Height of tab bar to exclude from calculations (default: 35px)
 * @returns Position and dimensions of drop zone
 */
/**
 * Calculate edge line dimensions (thin highlight for initial state)
 */
export function calculateEdgeLineDimensions(
  zoneType: DropZoneType,
  targetRect: DOMRect,
  tabBarHeight: number = 35,
  lineWidth: number = 3
): { x: number; y: number; width: number; height: number } {
  const contentTop = targetRect.top + tabBarHeight;
  
  switch (zoneType) {
    case 'top':
      // Top edge: horizontal line at the top of the panel (above tab bar)
      return {
        x: targetRect.left,
        y: targetRect.top, // Top of panel, above tab bar
        width: targetRect.width,
        height: lineWidth,
      };
    
    case 'bottom':
      // Bottom edge: horizontal line at the bottom
      return {
        x: targetRect.left,
        y: targetRect.bottom - lineWidth,
        width: targetRect.width,
        height: lineWidth,
      };
    
    case 'left':
      // Left edge: vertical line at the left
      return {
        x: targetRect.left,
        y: contentTop,
        width: lineWidth,
        height: targetRect.height - tabBarHeight,
      };
    
    case 'right':
      // Right edge: vertical line at the right
      return {
        x: targetRect.right - lineWidth,
        y: contentTop,
        width: lineWidth,
        height: targetRect.height - tabBarHeight,
      };
    
    default:
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
  }
}

export function calculateDropZoneDimensions(
  zoneType: DropZoneType,
  targetRect: DOMRect,
  defaultSize: number = 50, // percentage
  tabBarHeight: number = 35
): { x: number; y: number; width: number; height: number } {
  const contentTop = targetRect.top + tabBarHeight;
  const contentHeight = targetRect.height - tabBarHeight;
  const sizePercent = defaultSize / 100;
  
  switch (zoneType) {
    case 'top':
      // Top edge preview: show area above the panel (above tab bar)
      return {
        x: targetRect.left,
        y: targetRect.top, // Start from top of panel
        width: targetRect.width,
        height: contentHeight * sizePercent, // Preview height
      };
    
    case 'bottom':
      return {
        x: targetRect.left,
        y: targetRect.bottom - (contentHeight * sizePercent),
        width: targetRect.width,
        height: contentHeight * sizePercent,
      };
    
    case 'left':
      return {
        x: targetRect.left,
        y: contentTop,
        width: targetRect.width * sizePercent,
        height: contentHeight,
      };
    
    case 'right':
      return {
        x: targetRect.right - (targetRect.width * sizePercent),
        y: contentTop,
        width: targetRect.width * sizePercent,
        height: contentHeight,
      };
    
    case 'tab-bar':
      // Tab bar dimensions (full width, tab bar height)
      return {
        x: targetRect.left,
        y: targetRect.top,
        width: targetRect.width,
        height: tabBarHeight,
      };
    
    case 'empty-canvas':
      // Full viewport
      return {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    
    default:
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
  }
}

