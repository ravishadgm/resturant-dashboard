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


## Restaurant notifications
The restaurant-only /notifications page mirrors the admin UI: title, message, colored priority, all branches or selected branches, and a sent-only table. Recipient lists use /api/v1/restaurant/branches. History is saved per restaurant and account in this browser; sending is a preview until a delivery API is connected. Run npm run check:notifications for targeted checks.
