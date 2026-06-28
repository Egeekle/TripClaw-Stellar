## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-01-24 - [State Colocation for Simulated Feed]
**Learning:** High-frequency UI updates (e.g., a 3.5s demo interval) stored in a top-level page component like `Dashboard` cause unnecessary cascading re-renders of the entire page and all its static children (AgentHero, PageHeader).
**Action:** Push state down to the smallest possible consumer (State Colocation). If only the `LiveFeed` needs the demo events, move the state and the interval logic there. This isolates the re-renders to the specific component being updated, significantly improving performance for the rest of the layout.
