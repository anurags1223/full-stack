# Stateboard — Posts & Platform Manager

Stateboard is a responsive content-operations dashboard built with React and Redux Toolkit. It demonstrates normalized entity state, memoized selectors, async thunk lifecycles, listener middleware, and connected UI updates through a practical posts-and-platforms workflow.

## Features

- Create, edit, advance, and delete posts
- Search posts and filter them by status or platform
- Add and edit social platforms with custom accent colors
- Prevent deletion of platforms that still have linked posts
- Sync mock API content with pending, fulfilled, and rejected states
- Inspect the normalized Redux state shape and recent action activity
- Live metrics derived from store selectors
- Accessible dialogs, confirmation states, and responsive desktop/mobile layouts

## Tech stack

- React 19
- Redux Toolkit and React Redux
- Vite
- Plain CSS with no UI framework

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Quality checks

```bash
npm run lint
npm run build
```

## Project structure

```text
src/
  app/                 Redux store and listener middleware
  components/          Dashboard cards, dialogs, and inspector UI
  features/
    activity/          Recent Redux action log
    platforms/         Normalized platform entities and selection
    posts/             Normalized post entities, filters, and async thunk
  services/            Mock posts API
  App.jsx               Main connected dashboard
  index.css             Responsive application styles
```

All data is intentionally local and resets when the page reloads. The mock API simulates a network request without requiring a backend or credentials.
