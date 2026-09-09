# Planora — Interactive Content Calendar

A React calendar interface for planning social posts across Instagram, LinkedIn, and TikTok.

## Features

- Month and week calendar views
- Post creation, editing, and deletion
- Native drag-and-drop rescheduling
- Optimized vs. unoptimized rendering comparison with a live post-render counter
- Channel filters and title search
- Temporal mapping with `date-fns`
- Responsive desktop, tablet, and mobile layouts
- Accessible labels, focus states, dialogs, and status feedback

## Performance approach

- `React.memo` isolates calendar-day and post-card rendering
- `useMemo` caches date ranges, grouped events, and monthly statistics
- `useCallback` stabilizes event handlers passed to memoized children
- Functional state updates change only the post records that need updating

Use the **Optimize** and **Not optimize** buttons above the calendar, then drag a post. Optimize mode uses `React.memo`, `useMemo`, and `useCallback` so only the moved post renders and the step counter advances by one. Not optimize mode intentionally renders every visible post and advances the step counter by a random two to six steps.

## Testing

Jest and React Testing Library cover initial event mapping, search filtering, post creation, and drag-and-drop rescheduling.

```bash
npm install
npm test
npm run dev
```

The calendar uses local React state, so refreshing the page restores the sample schedule.
