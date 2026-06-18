## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2026-06-18 - [Global Context Provider Memoization]
**Learning:** In a large React application, failing to memoize the value object of a top-level Context Provider (like `OpenClawProvider`) causes the entire component tree to re-render whenever the provider re-renders. This is especially impactful when the provider has frequent updates, such as health polling intervals or high-frequency WebSocket events.
**Action:** Always wrap the Context Provider's value object in `useMemo` and ensure all state variables and functions (which should be wrapped in `useCallback`) are included in the dependency array. This guarantees that consumer components only re-render when the specific data they depend on actually changes.
