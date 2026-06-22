## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2026-06-22 - [State Colocation & Context Memoization]
**Learning:** High-frequency UI updates (like demo intervals) in top-level components cause cascading re-renders across the entire tree. Localizing state to the specific sub-component (State Colocation) and memoizing the global context value are high-leverage patterns to stabilize the application.
**Action:** Always identify the smallest possible component that needs a piece of state. Memoize global context values and wrap layout components in `React.memo` to shield them from parent updates.
