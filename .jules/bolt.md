## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-05-24 - [Map Marker Granular Memoization]
**Learning:** Even if a Map container is memoized, a single changing prop (like an `agents` array updating every 3s) triggers a full re-render of all markers inside it. Static markers (Swarms) and user indicators should be extracted into their own `React.memo()` components to remain stable while other dynamic markers update.
**Action:** Extract markers into sub-components wrapped in `memo`. Pass only the specific data needed for that marker. Ensure coordinates are calculated inside the memoized component or passed as stable props.
