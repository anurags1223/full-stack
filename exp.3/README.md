# PostFlow

PostFlow is a local educational project built with JavaScript, React.js, React
Router, and the Context API. It combines dummy JWT authentication, stateless
client-side sessions, protected routes, and role-based access control.

No TypeScript, backend, database, hosting configuration, or deployment service
is used. The JWT is simulated in the browser for demonstration purposes.

## Demo accounts

| Role | Username | Password | Access |
| --- | --- | --- | --- |
| Admin | admin | admin123 | Create, edit, delete, and manage roles |
| Editor | editor | editor123 | Create and edit; delete buttons are hidden |
| Viewer | view | view123 | Read-only access |

The starting library contains 22 posts: 10 created by the Admin and 12 created
by the Editor.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` to verify the production build locally.

## Security note

This app demonstrates JWT structure, expiry checks, browser storage, route
guards, and UI permissions. A production app must create and verify signed
tokens on a trusted server and enforce authorization on that server.
