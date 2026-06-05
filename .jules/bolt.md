## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-05-15 - [Pushing Simulation State Down]
**Learning:** Simulated real-time updates (like intervals for demo events) are often placed in high-level page components, causing the entire page tree to re-render. Pushing this "noise" down into the leaf component that actually displays the data prevents unnecessary re-renders of stable layout elements (Header, Hero, Nav).
**Action:** Always localize interval-driven state to the specific UI component consuming it. If the data is needed by multiple siblings, use a specialized context or state manager, but avoid lifting it to a generic "Page" component unless absolutely necessary.
