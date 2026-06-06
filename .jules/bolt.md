## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-06-06 - [State Localization for Dashboard Performance]
**Learning:** The Dashboard was re-rendering every 3.5 seconds due to a simulated "Live Feed" interval. Localizing this state into the LiveFeed component prevents unnecessary re-renders of the entire dashboard page, including static headers and hero sections.
**Action:** Identify high-frequency state updates that are only used by a single sub-component and "push the state down" to isolate the performance impact.
