## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-01-24 - [Localizing High-Frequency Updates]
**Learning:** High-frequency updates (like a 3.5s interval for demo events) in a top-level page component like Dashboard trigger expensive re-renders for the entire component tree. This is particularly costly when the tree includes complex components with animations, blurs, and SVGs (like AgentHero).
**Action:** Push high-frequency state down to the specific component that consumes it (e.g., LiveFeed). Use React.memo on sibling components to ensure they stay isolated from those updates.
