## 2025-01-24 - [React Map Rendering Optimization]
**Learning:** The `MapView` component was re-rendering on every parent state change (e.g., toggling UI overlays) because it wasn't memoized and received new references for arrays and callbacks on every render. Heavy components like maps should be isolated from frequent UI state updates in their parents.
**Action:** Use `React.memo()` for the heavy component. Ensure all props passed to it are stable by using `useMemo()` for derived data and `useCallback()` for event handlers. Move static constants and pure utility functions outside the component body to reduce render-cycle overhead.

## 2025-01-24 - [PWA for iOS Performance]
**Learning:** Users wanting to "run as app in iOS" are looking for PWA support (Progressive Web App). Adding a manifest and apple-specific meta tags significantly improves perceived performance and UX by allowing "standalone" mode (no browser chrome) and faster access from the home screen.
**Action:** Always include `site.webmanifest`, a high-quality `apple-touch-icon`, and `apple-mobile-web-app-capable` meta tags when mobile app-like experience is requested.
