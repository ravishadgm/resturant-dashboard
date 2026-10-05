# Separate dashboard deployments

The `admin` and `restaurant` Git branches are independent deployment sources. `main` retains the combined app.

| Branch | Login | Modules |
| --- | --- | --- |
| admin | Admin | Dashboard, Restaurants, Branches, Managers, Customers, Tables, Live queue, History |
| restaurant | Restaurant | Dashboard, My Profile, Branches, Managers, Tables |

Each branch fixes its portal in `src/utils/portal.js`. Login endpoints, allowed routes, and browser session storage are isolated by portal.

## Host each branch

Create two hosting projects connected to this repository. Select `admin` as one project's deployment branch and `restaurant` as the other's.

- Install command: `npm ci`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://godine.cloud` (or your API server)
- Configure SPA fallback: all application URLs must serve `index.html`.

Use different domains or subdomains for the projects. The API server must allow both frontend origins through CORS and enforce account permissions. No API keys are needed in the frontend.

## Run locally

```powershell
git switch admin
npm ci
npm run dev
```

Use `git switch restaurant` to run the restaurant version. Stop the dev server before switching branches.

The prebuilt `dist` directory is also committed on each branch for static hosting. Rebuild it whenever frontend code changes.

## Branch Owner portal

The `branch` Git branch hosts the Branch Owner portal independently.

- Login: `POST /api/v1/auth/branch/login` with email and password.
- Logout: `POST /api/v1/auth/branch/logout` with the stored bearer token.
- Session keys are isolated under `restrodesk_branch_*`.
- Only the authenticated account overview is exposed; operational modules can be added with branch-specific APIs.
- Build: `npm ci` then `npm run build`. Publish `dist` with SPA fallback.
- Set `VITE_API_BASE_URL` to the API server for this deployment.
