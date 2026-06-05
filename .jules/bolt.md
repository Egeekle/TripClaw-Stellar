## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-02-12 - [Dashboard Re-render Optimization via State Colocation]
**Learning:** High-frequency state updates (like a 3.5s simulated activity timer) in a top-level page component (Dashboard) cause the entire page tree to re-render, including animated hero sections and navigation headers. "Pushing state down" to the specific component that needs it (LiveFeed) isolates these renders.
**Action:** Identify state that is only used by a single child component and move that state (and its associated effects/timers) into that child. This significantly reduces the render surface area for frequent updates.
