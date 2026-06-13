## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-01-24 - [State Colocation for Performance]
**Learning:** High-frequency state updates (e.g., intervals, timers) in a parent layout component like `Dashboard` cause unnecessary re-renders of the entire page tree. Moving such state into the specific leaf component that uses it ("pushing state down") prevents these cascading re-renders.
**Action:** Identify components receiving high-frequency updates and move that state management into the component itself or a dedicated sub-component.
