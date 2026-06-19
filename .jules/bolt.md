## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-01-24 - [Dashboard Render Frequency Optimization]
**Learning:** A high-frequency simulated interval (3.5s) in the Dashboard caused the entire page (including stable components like PageHeader and BottomNav) to re-render. State Colocation is critical for moving "dirty" state as deep as possible in the tree.
**Action:** Pushed high-frequency simulated state down to the specific consumer component (LiveFeed) and used `React.memo` to shield other top-level layout components from remaining parent re-renders.
