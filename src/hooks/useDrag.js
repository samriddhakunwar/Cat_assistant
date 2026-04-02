import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useDrag Hook
 * Implements full drag-and-drop for the Electron BrowserWindow by tracking
 * mouse events in the renderer and moving the native window via IPC.
 *
 * Features:
 *  - Click + drag anywhere on the cat to move the window
 *  - Screen-boundary clamping (prevents going off-screen, allows partial edge)
 *  - Position persistence (saved automatically via the main process)
 *  - Double-click to reset to default position (bottom-right corner)
 *  - Smooth dragging with requestAnimationFrame batching
 *
 * Returns:
 *  - isDragging: boolean — true while a drag is in progress
 *  - dragHandlers: { onMouseDown, onDoubleClick } — attach these to the draggable element
 */
export function useDrag() {
  const [isDragging, setIsDragging] = useState(false);

  // Refs persist across renders without causing re-renders
  const draggingRef = useRef(false);        // Internal flag (avoids stale closure issues)
  const startMouseRef = useRef({ x: 0, y: 0 }); // Mouse position at drag start (screen coords)
  const startWinRef = useRef({ x: 0, y: 0 });   // Window position at drag start
  const screenSizeRef = useRef({ width: 1920, height: 1080 }); // Cached screen dimensions
  const rafIdRef = useRef(null);            // requestAnimationFrame ID for batching
  const pendingPosRef = useRef(null);       // Latest position waiting to be applied

  // Window dimensions (must match BrowserWindow size in main.js)
  const WIN_WIDTH = 280;
  const WIN_HEIGHT = 350;

  // How many pixels of the window can hang off-screen (partial edge snapping)
  const EDGE_MARGIN = 40;

  /**
   * Clamp the window position so at least EDGE_MARGIN pixels remain visible
   * on every edge of the screen.
   */
  const clampPosition = useCallback((x, y) => {
    const { width: screenW, height: screenH } = screenSizeRef.current;
    // Keep the FULL window within screen bounds (no off-screen drift)
    const clampedX = Math.max(0, Math.min(x, screenW - WIN_WIDTH));
    const clampedY = Math.max(0, Math.min(y, screenH - WIN_HEIGHT));
    return { x: clampedX, y: clampedY };
  }, []);

  /**
   * Apply the latest pending position to the window.
   * Uses requestAnimationFrame to batch rapid mousemove events
   * and avoid flooding the main process with IPC calls.
   */
  const applyPendingPosition = useCallback(() => {
    rafIdRef.current = null;
    if (pendingPosRef.current && window.electronAPI) {
      window.electronAPI.setWindowPosition(
        pendingPosRef.current.x,
        pendingPosRef.current.y
      );
      pendingPosRef.current = null;
    }
  }, []);

  /**
   * Schedule a position update. If one is already scheduled for the
   * current animation frame, the latest position simply overwrites the
   * pending value — so we never call setWindowPosition more than once
   * per frame.
   */
  const schedulePositionUpdate = useCallback((x, y) => {
    const clamped = clampPosition(x, y);
    pendingPosRef.current = clamped;
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(applyPendingPosition);
    }
  }, [clampPosition, applyPendingPosition]);

  // --- Mouse event handlers (attached to document during drag) ---

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current) return;

    // Calculate how far the mouse moved since drag started
    const deltaX = e.screenX - startMouseRef.current.x;
    const deltaY = e.screenY - startMouseRef.current.y;

    // New window position = original position + delta
    const newX = startWinRef.current.x + deltaX;
    const newY = startWinRef.current.y + deltaY;

    schedulePositionUpdate(newX, newY);
  }, [schedulePositionUpdate]);

  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setIsDragging(false);

    // Flush any pending position update immediately
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (pendingPosRef.current && window.electronAPI) {
      window.electronAPI.setWindowPosition(
        pendingPosRef.current.x,
        pendingPosRef.current.y
      );
      pendingPosRef.current = null;
    }

    // Remove global listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Re-enable pointer events on the body
    document.body.style.cursor = '';
  }, [handleMouseMove]);

  /**
   * onMouseDown — start a drag operation.
   * Records the initial mouse position (in screen coordinates) and the
   * current window position, then attaches global mousemove/mouseup listeners.
   */
  const onMouseDown = useCallback(async (e) => {
    // Only respond to left-click
    if (e.button !== 0) return;
    // Don't start drag on control buttons
    if (e.target.closest('.control-btn') || e.target.closest('.notification-bubble')) return;

    e.preventDefault();

    // Cache the screen size (in case resolution changed)
    if (window.electronAPI) {
      try {
        const size = await window.electronAPI.getScreenSize();
        screenSizeRef.current = size;
      } catch (err) {
        console.warn('Could not get screen size:', err);
      }

      // Capture the window's current position
      try {
        const winPos = await window.electronAPI.getWindowPosition();
        startWinRef.current = winPos;
      } catch (err) {
        console.warn('Could not get window position:', err);
      }
    }

    // Capture the mouse's screen position at drag start
    startMouseRef.current = { x: e.screenX, y: e.screenY };

    draggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';

    // Attach global listeners so the drag continues even if the mouse
    // leaves the window bounds
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  /**
   * onDoubleClick — reset the window to its default position (bottom-right).
   */
  const onDoubleClick = useCallback(async (e) => {
    // Don't reset on control buttons
    if (e.target.closest('.control-btn') || e.target.closest('.notification-bubble')) return;

    if (window.electronAPI) {
      try {
        await window.electronAPI.resetWindowPosition();
      } catch (err) {
        console.error('Failed to reset window position:', err);
      }
    }
  }, []);

  // Cleanup: remove any lingering listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    dragHandlers: {
      onMouseDown,
      onDoubleClick,
    },
  };
}
