## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-01-24 - [State Colocation for High-Frequency Updates]
**Learning:** High-frequency state updates (like a 3.5s demo simulation interval) in a top-level component like `Dashboard` cause the entire component tree to re-render, even if only one small child component uses that data. This "render blast radius" is a major performance bottleneck in complex dashboards.
**Action:** Push high-frequency state down (State Colocation). Move the interval and its state into the specific child component that needs it (`LiveFeed`). This isolates the re-renders to only that child, shielding the rest of the dashboard (e.g., `AgentHero`, `PageHeader`) from unnecessary updates.
