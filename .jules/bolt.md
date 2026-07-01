## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-05-15 - [Dashboard Re-render Bottleneck & State Colocation]
**Learning:** A high-frequency re-render bottleneck (every 3.5s) in the Dashboard was identified, caused by keeping a demo simulation interval at the page level. This triggered unnecessary re-renders of stable layout components like PageHeader and BottomNav.
**Action:** Localize high-frequency updates into the specific sub-components (State Colocation) and apply React.memo to visually complex or high-level layout components to shield them from parent state updates that do not affect their props.
