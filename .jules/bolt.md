## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-05-27 - [Dashboard Render Optimization - Pushing State Down]
**Learning:** High-frequency updates (e.g., 3.5s simulated intervals) in a parent component like `Dashboard` cause expensive re-renders of all layout children (`AgentHero`, `PageHeader`, etc.).
**Action:** Push high-frequency demo state down into the specific component (`LiveFeed`) that needs it. Additionally, use `React.memo` for layout components and `useMemo` for context values to provide multiple layers of defense against unnecessary re-renders.
