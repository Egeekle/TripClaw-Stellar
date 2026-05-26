## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2026-05-26 - [High-Frequency State Localization]
**Learning:** Frequent state updates (like 3.5s intervals for demo data) in a top-level page component like `Dashboard` cause unnecessary re-renders of the entire page tree. Pushing this high-frequency state down into the specific component that consumes it (e.g., `LiveFeed`) significantly reduces the rendering surface area.
**Action:** Identify components with localized high-frequency updates and "push state down" to them. Combine this with `React.memo` for static siblings and `useMemo` for context values to achieve optimal rendering performance.
