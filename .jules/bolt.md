## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2026-06-09 - [State Colocation for Dashboard Live Feed]
**Learning:** A high-frequency re-render (every 3.5s) was being triggered on the entire Dashboard because the "demo mode" interval state was kept in the parent. This caused the Hero, Stats, and Navigation components to re-render unnecessarily.
**Action:** Colocate state to the specific component that needs it (Pushing State Down). Move simulated intervals and their state into the leaf component (LiveFeed) to isolate render cycles.
