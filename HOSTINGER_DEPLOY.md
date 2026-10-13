# Hostinger deployment

Use one domain with three folders:

| Git branch | Vite base | Upload destination | URL |
| --- | --- | --- | --- |
| admin | /admin/ | public_html/admin/ | https://YOUR-DOMAIN/admin/ |
| restaurant | /restaurant/ | public_html/restaurant/ | https://YOUR-DOMAIN/restaurant/ |
| branch | /branch/ | public_html/branch/ | https://YOUR-DOMAIN/branch/ |

Each Git branch contains a different portal. A build base changes URLs only; it does not turn an admin build into a restaurant or branch portal.

## Prepare each portal

Apply these deployment configuration changes to each portal branch before building:
- Vite supports VITE_APP_BASE_PATH (or its --base CLI flag).
- BrowserRouter uses basename={import.meta.env.BASE_URL}.
- public/.htaccess is included in the build.

Keep each branch's existing src/utils/portal.js and authentication code. Use separate checkouts to avoid overwriting ongoing work.

In the admin checkout:
```powershell
npm ci
npm run build -- --base=/admin/
```

In the restaurant checkout:
```powershell
npm ci
npm run build -- --base=/restaurant/
```

In the branch checkout:
```powershell
npm ci
npm run build -- --base=/branch/
```

Alternatively, set VITE_APP_BASE_PATH in that checkout's .env.production. The API URL remains VITE_API_BASE_URL; do not replace it with the frontend folder.

## Upload with your existing VS Code connection

Create admin, restaurant, and branch directories inside public_html. Upload the **contents** of each matching dist folder into its destination, including the hidden .htaccess file:

```text
public_html/
  admin/
    index.html
    .htaccess
    assets/
  restaurant/
    index.html
    .htaccess
    assets/
  branch/
    index.html
    .htaccess
    assets/
```

Do not upload the source, node_modules, .git, or environment files. Do not upload all three builds into the same directory. Preserve any existing website in public_html.

## Verify

Open /admin/login, /restaurant/login, and /branch/login on your domain. Refresh each page directly, sign in with the appropriate role, and confirm navigation stays within the portal's folder. If refreshing returns 404, confirm .htaccess was uploaded and rewrite rules are enabled. If assets fail, confirm that the Vite base matches the upload directory.

All three upload builds are prepared: hostinger/admin/, hostinger/restaurant/, and hostinger/branch/. The admin build uses the current workspace; restaurant and branch use isolated snapshots of their matching Git branches with the subfolder configuration applied. Upload only these three build folders, not the source snapshots or source archives also inside hostinger/. Future builds must use each matching portal branch.
