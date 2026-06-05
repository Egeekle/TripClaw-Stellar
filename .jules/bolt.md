## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-05-22 - [Pushing State Down & Context Stability]
**Learning:** High-frequency state updates (like a 3.5s simulation interval) in a top-level page component like `Dashboard` cause massive VDOM thrashing across the entire page. Additionally, unmemoized Context Provider values force re-renders on all consumers.
**Action:** Localize high-frequency state to the specific leaf component that uses it (e.g., `LiveFeed`). Wrap Context Provider values in `useMemo` to ensure stability.

## 2025-05-22 - [Auth Hook Loading Blocker]
**Learning:** Components guarded by `RequireAuth` can hang indefinitely if the `useAuth` hook stays in a `loading: true` state due to missing Supabase environment variables.
**Action:** Ensure `useAuth` has an immediate fallback path to local/demo mode when `supabase` is null, setting `loading: false` immediately.
