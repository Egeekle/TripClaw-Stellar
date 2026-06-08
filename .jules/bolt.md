## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-05-22 - [State Colocation for High-Frequency Updates]
**Learning:** High-frequency state updates (e.g., a 3.5s interval for demo events) at a page level (Dashboard) trigger unnecessary re-renders of the entire page layout including navigation and hero sections.
**Action:** Colocate high-frequency state within the specific leaf component that needs it (LiveFeed). This prevents the re-render from propagating up the component tree and keeps the "expensive" parts of the page stable.
