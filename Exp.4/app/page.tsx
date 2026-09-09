'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { Activity, Bell, CalendarDays, ChevronLeft, ChevronRight, Clock3, Grid2X2, LayoutDashboard, ListFilter, MoreHorizontal, PencilLine, Plus, Search, Sparkles, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Channel = 'Instagram' | 'LinkedIn' | 'TikTok';
type Status = 'Scheduled' | 'Draft';
type ViewMode = 'month' | 'week';
type PerformanceMode = 'optimized' | 'unoptimized';
export type Post = { id: number; title: string; date: string; time: string; channel: Channel; status: Status; accent: string };

const INITIAL_POSTS: Post[] = [
  { id: 1, title: 'Behind the scenes', date: '2026-09-02', time: '09:30', channel: 'Instagram', status: 'Scheduled', accent: 'coral' },
  { id: 2, title: 'Q3 product recap', date: '2026-09-04', time: '11:00', channel: 'LinkedIn', status: 'Scheduled', accent: 'blue' },
  { id: 3, title: 'Creator spotlight', date: '2026-09-07', time: '10:00', channel: 'Instagram', status: 'Draft', accent: 'violet' },
  { id: 4, title: '3 workflow tips', date: '2026-09-09', time: '14:30', channel: 'TikTok', status: 'Scheduled', accent: 'mint' },
  { id: 5, title: 'Team culture notes', date: '2026-09-11', time: '08:45', channel: 'LinkedIn', status: 'Scheduled', accent: 'amber' },
  { id: 6, title: 'September moodboard', date: '2026-09-14', time: '12:00', channel: 'Instagram', status: 'Scheduled', accent: 'pink' },
  { id: 7, title: 'Feature walkthrough', date: '2026-09-17', time: '16:00', channel: 'TikTok', status: 'Draft', accent: 'cyan' },
  { id: 8, title: 'Customer story: Noma', date: '2026-09-21', time: '10:30', channel: 'LinkedIn', status: 'Scheduled', accent: 'blue' },
  { id: 9, title: 'Desk setup reel', date: '2026-09-23', time: '13:00', channel: 'Instagram', status: 'Scheduled', accent: 'coral' },
  { id: 10, title: 'Launch countdown', date: '2026-09-25', time: '17:30', channel: 'TikTok', status: 'Scheduled', accent: 'violet' },
  { id: 11, title: 'Founder field notes', date: '2026-09-28', time: '09:00', channel: 'LinkedIn', status: 'Draft', accent: 'amber' },
];
const CHANNELS: Channel[] = ['Instagram', 'LinkedIn', 'TikTok'];
const ACCENTS = ['coral', 'blue', 'violet', 'mint', 'amber', 'pink', 'cyan'];
const EMPTY_POSTS: Post[] = [];

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

function channelIcon(channel: Channel) {
  if (channel === 'Instagram') return <span className="channel-letter" aria-hidden>◎</span>;
  if (channel === 'LinkedIn') return <span className="channel-letter" aria-hidden>in</span>;
  return <span className="tiktok-mark" aria-hidden>♪</span>;
}

type PostCardProps = { post: Post; onEdit: (post: Post) => void; onRender: () => void };

function PostCardBase({ post, onEdit, onRender }: PostCardProps) {
  useEffect(() => { onRender(); });
  return <button className={`post-card accent-${post.accent}`} draggable onDragStart={(event) => event.dataTransfer.setData('text/post-id', String(post.id))} onClick={(event) => { event.stopPropagation(); onEdit(post); }} aria-label={`Edit ${post.title}, ${post.channel} at ${post.time}`}>
    <span className="post-time">{format(new Date(`2026-01-01T${post.time}`), 'h:mm a')}</span>
    <span className="post-title">{post.title}</span>
    <span className="post-channel">{channelIcon(post.channel)} {post.channel}</span>
  </button>;
}

const OptimizedPostCard = memo(PostCardBase);

type CalendarDayProps = { date: Date; currentMonth: Date; posts: Post[]; onAdd: (date: Date) => void; onEdit: (post: Post) => void; onDropPost: (id: number, date: Date) => void; onPostRender: () => void; optimized: boolean };

function CalendarDayBase({ date, currentMonth, posts, onAdd, onEdit, onDropPost, onPostRender, optimized }: CalendarDayProps) {
  const today = isSameDay(date, new Date(2026, 8, 9));
  const Card = optimized ? OptimizedPostCard : PostCardBase;
  return <div className={`calendar-day ${!isSameMonth(date, currentMonth) ? 'outside' : ''} ${today ? 'today' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = Number(event.dataTransfer.getData('text/post-id')); if (id) onDropPost(id, date); }} onDoubleClick={() => onAdd(date)} data-testid={`day-${format(date, 'yyyy-MM-dd')}`}>
    <div className="day-heading"><span className="day-number">{format(date, 'd')}</span>{today && <span className="today-label">Today</span>}<button className="day-add" onClick={() => onAdd(date)} aria-label={`Add post on ${format(date, 'MMMM d')}`}><Plus /></button></div>
    <div className="day-posts">{posts.slice(0, 3).map((post) => <Card key={post.id} post={post} onEdit={onEdit} onRender={onPostRender} />)}{posts.length > 3 && <span className="more-posts">+{posts.length - 3} more</span>}</div>
  </div>;
}

const OptimizedCalendarDay = memo(CalendarDayBase);

const MiniCalendar = memo(function MiniCalendar({ month, selectedDate, onSelect }: { month: Date; selectedDate: Date; onSelect: (date: Date) => void }) {
  const days = useMemo(() => { const start = startOfWeek(startOfMonth(month)); return eachDayOfInterval({ start, end: addDays(start, 34) }); }, [month]);
  return <section className="mini-calendar" aria-label="Mini calendar"><div className="mini-title"><strong>{format(month, 'MMMM yyyy')}</strong><span><ChevronLeft /><ChevronRight /></span></div><div className="mini-weekdays">{'SMTWTFS'.split('').map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="mini-grid">{days.map((day) => <button key={day.toISOString()} onClick={() => onSelect(day)} className={`${!isSameMonth(day, month) ? 'muted' : ''} ${isSameDay(day, selectedDate) ? 'selected' : ''}`}>{format(day, 'd')}</button>)}</div></section>;
});

export default function Home() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 8, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 9));
  const [view, setView] = useState<ViewMode>('month');
  const [activeChannels, setActiveChannels] = useState<Channel[]>(CHANNELS);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Post | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('optimized');
  const [lastRenderCount, setLastRenderCount] = useState<number | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [lastStepDelta, setLastStepDelta] = useState<number | null>(null);
  const renderCounter = useRef(0);

  const visibleDays = useMemo(() => {
    if (view === 'week') { const start = startOfWeek(selectedDate); return eachDayOfInterval({ start, end: endOfWeek(selectedDate) }); }
    return eachDayOfInterval({ start: startOfWeek(startOfMonth(currentMonth)), end: endOfWeek(endOfMonth(currentMonth)) });
  }, [currentMonth, selectedDate, view]);

  const postsByDate = useMemo(() => {
    const result: Record<string, Post[]> = {}; const query = search.trim().toLowerCase();
    posts.forEach((post) => { if (!activeChannels.includes(post.channel) || (query && !post.title.toLowerCase().includes(query))) return; (result[post.date] ??= []).push(post); });
    Object.values(result).forEach((items) => items.sort((a, b) => a.time.localeCompare(b.time))); return result;
  }, [posts, activeChannels, search]);

  const monthStats = useMemo(() => { const inMonth = posts.filter((post) => post.date.startsWith(format(currentMonth, 'yyyy-MM'))); return { total: inMonth.length, scheduled: inMonth.filter((post) => post.status === 'Scheduled').length, drafts: inMonth.filter((post) => post.status === 'Draft').length }; }, [posts, currentMonth]);
  const openNew = useCallback((date = selectedDate) => { setEditing({ id: Date.now(), title: '', date: format(date, 'yyyy-MM-dd'), time: '10:00', channel: 'Instagram', status: 'Scheduled', accent: ACCENTS[posts.length % ACCENTS.length] }); setDialogOpen(true); }, [posts.length, selectedDate]);
  const openEdit = useCallback((post: Post) => { setEditing(post); setDialogOpen(true); }, []);
  const recordPostRender = useCallback(() => { renderCounter.current += 1; }, []);
  const movePost = useCallback((id: number, date: Date) => { const stepDelta = performanceMode === 'optimized' ? 1 : Math.floor(Math.random() * 5) + 2; renderCounter.current = 0; setLastRenderCount(null); setLastStepDelta(stepDelta); setStepCount((count) => count + stepDelta); setPosts((items) => items.map((post) => post.id === id ? { ...post, date: format(date, 'yyyy-MM-dd') } : post)); setNotice(`Post moved to ${format(date, 'MMM d')} · +${stepDelta} step${stepDelta === 1 ? '' : 's'}`); window.setTimeout(() => setLastRenderCount(renderCounter.current), 50); window.setTimeout(() => setNotice(''), 2200); }, [performanceMode]);
  const savePost = useCallback(() => { if (!editing?.title.trim()) return; setPosts((items) => items.some((post) => post.id === editing.id) ? items.map((post) => post.id === editing.id ? editing : post) : [...items, editing]); setDialogOpen(false); setNotice('Schedule updated'); window.setTimeout(() => setNotice(''), 2200); }, [editing]);
  const removePost = useCallback(() => { if (!editing) return; setPosts((items) => items.filter((post) => post.id !== editing.id)); setDialogOpen(false); setNotice('Post removed'); window.setTimeout(() => setNotice(''), 2200); }, [editing]);
  const changeMonth = (direction: -1 | 1) => { const next = direction === 1 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1); setCurrentMonth(next); setSelectedDate(startOfMonth(next)); };

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'create_scheduled_post',
      title: 'Create scheduled post',
      description: 'Create a social post on the visible Planora content calendar.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1 },
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
          channel: { type: 'string', enum: CHANNELS },
        },
        required: ['title', 'date', 'time', 'channel'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const value = input as Partial<Post>;
        if (!value.title?.trim() || !value.date || !/^\d{4}-\d{2}-\d{2}$/.test(value.date) || !value.time || !/^\d{2}:\d{2}$/.test(value.time) || !CHANNELS.includes(value.channel as Channel)) throw new Error('Invalid post details');
        const post: Post = { id: Date.now(), title: value.title.trim(), date: value.date, time: value.time, channel: value.channel as Channel, status: 'Scheduled', accent: ACCENTS[posts.length % ACCENTS.length] };
        setPosts((items) => [...items, post]);
        return { id: post.id, status: 'scheduled', date: post.date, time: post.time };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [posts.length]);

  return <main className="app-shell">
    <aside className="main-sidebar"><div className="brand"><span className="brand-mark"><Sparkles /></span><span>Planora</span></div><nav aria-label="Primary navigation"><a href="#"><LayoutDashboard /> Overview</a><a href="#calendar" className="active"><CalendarDays /> Calendar</a><a href="#"><PencilLine /> Content</a><a href="#"><Grid2X2 /> Media library</a><a href="#"><Users /> Team</a></nav></aside>
    <section className="workspace" id="calendar">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><Sparkles /></span><strong>Planora</strong></div><label className="search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search scheduled posts" aria-label="Search scheduled posts" /></label><div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell /><span className="notification-dot" /></button><Button className="create-button" onClick={() => openNew()}><Plus /> Create post</Button></div></header>
      <div className="content-layout">
        <aside className="calendar-sidebar"><MiniCalendar month={currentMonth} selectedDate={selectedDate} onSelect={(date) => { setSelectedDate(date); setCurrentMonth(startOfMonth(date)); }} /><section className="filters"><div className="section-label"><span>Channels</span><ListFilter /></div>{CHANNELS.map((channel) => <label key={channel} className="channel-filter"><input type="checkbox" checked={activeChannels.includes(channel)} onChange={() => setActiveChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel])} /><span className={`channel-icon ${channel.toLowerCase()}`}>{channelIcon(channel)}</span><span>{channel}</span><small>{posts.filter((post) => post.channel === channel).length}</small></label>)}</section><section className="summary-card"><span className="eyebrow">This month</span><strong>{monthStats.total} posts planned</strong><div className="progress"><span style={{ width: `${Math.round((monthStats.scheduled / Math.max(monthStats.total, 1)) * 100)}%` }} /></div><div className="summary-row"><span><i className="dot published" />{monthStats.scheduled} scheduled</span><span><i className="dot draft" />{monthStats.drafts} drafts</span></div></section></aside>
        <section className="calendar-panel"><div className="calendar-toolbar"><div><span className="eyebrow">Content calendar</span><h1>{view === 'month' ? format(currentMonth, 'MMMM yyyy') : `${format(visibleDays[0], 'MMM d')} – ${format(visibleDays[6], 'MMM d, yyyy')}`}</h1></div><div className="toolbar-actions"><div className="month-nav"><button onClick={() => changeMonth(-1)} aria-label="Previous month"><ChevronLeft /></button><button onClick={() => { const today = new Date(2026, 8, 9); setCurrentMonth(startOfMonth(today)); setSelectedDate(today); }}>Today</button><button onClick={() => changeMonth(1)} aria-label="Next month"><ChevronRight /></button></div><Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}><TabsList className="view-tabs"><TabsTrigger value="month">Month</TabsTrigger><TabsTrigger value="week">Week</TabsTrigger></TabsList></Tabs><button className="more-button" aria-label="More calendar options"><MoreHorizontal /></button></div></div><div className={`performance-lab ${performanceMode}`}><div className="performance-copy"><span className="performance-icon"><Activity /></span><div><strong>Performance comparison</strong><small>{performanceMode === 'optimized' ? 'React.memo + useMemo + useCallback' : 'Random multi-step update without memoization'}</small></div></div><div className="performance-buttons" aria-label="Rendering mode"><Button size="sm" variant={performanceMode === 'optimized' ? 'default' : 'ghost'} onClick={() => { setPerformanceMode('optimized'); setLastRenderCount(null); setStepCount(0); setLastStepDelta(null); }}>Optimize</Button><Button size="sm" variant={performanceMode === 'unoptimized' ? 'default' : 'ghost'} onClick={() => { setPerformanceMode('unoptimized'); setLastRenderCount(null); setStepCount(0); setLastStepDelta(null); }}>Not optimize</Button></div><div className="performance-metrics"><output className="render-result" aria-live="polite"><span>{lastRenderCount ?? '—'}</span><small>{lastRenderCount === null ? 'Post renders' : `post render${lastRenderCount === 1 ? '' : 's'}`}</small></output><output className="step-result" aria-live="polite"><span>{stepCount}</span><small>Steps {lastStepDelta !== null && <b>+{lastStepDelta}</b>}</small></output></div></div><div className={`calendar-grid ${view === 'week' ? 'week-view' : ''}`}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div className="weekday" key={day}>{day}</div>)}{visibleDays.map((date) => { const Day = performanceMode === 'optimized' ? OptimizedCalendarDay : CalendarDayBase; return <Day key={date.toISOString()} date={date} currentMonth={currentMonth} posts={postsByDate[format(date, 'yyyy-MM-dd')] ?? EMPTY_POSTS} onAdd={openNew} onEdit={openEdit} onDropPost={movePost} onPostRender={recordPostRender} optimized={performanceMode === 'optimized'} />; })}</div><div className="calendar-hint"><span><Clock3 /> Drag a post: Optimize adds 1 step, Not optimize adds 2–6</span><span>Double-click any day to create</span></div></section>
      </div>
    </section>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="post-dialog"><DialogHeader><DialogTitle>{posts.some((post) => post.id === editing?.id) ? 'Edit scheduled post' : 'Create a post'}</DialogTitle><DialogDescription>Set the channel, publishing time, and status.</DialogDescription></DialogHeader>{editing && <div className="form-grid"><label className="field full"><span>Post title</span><Input autoFocus value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} placeholder="What are you sharing?" /></label><label className="field"><span>Date</span><Input type="date" value={editing.date} onChange={(event) => setEditing({ ...editing, date: event.target.value })} /></label><label className="field"><span>Time</span><Input type="time" value={editing.time} onChange={(event) => setEditing({ ...editing, time: event.target.value })} /></label><label className="field"><span>Channel</span><select value={editing.channel} onChange={(event) => setEditing({ ...editing, channel: event.target.value as Channel })}>{CHANNELS.map((channel) => <option key={channel}>{channel}</option>)}</select></label><label className="field"><span>Status</span><select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as Status })}><option>Scheduled</option><option>Draft</option></select></label></div>}<DialogFooter className="dialog-footer">{posts.some((post) => post.id === editing?.id) && <Button variant="destructive" onClick={removePost}>Delete</Button>}<div className="footer-right"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button className="save-button" onClick={savePost} disabled={!editing?.title.trim()}>Save post</Button></div></DialogFooter></DialogContent></Dialog>
    {notice && <div className="toast" role="status"><span>✓</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X /></button></div>}
  </main>;
}
