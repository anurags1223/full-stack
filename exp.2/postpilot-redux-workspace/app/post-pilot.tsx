"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  FileText,
  Grid2X2,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import {
  fetchPosts,
  platformSelectors,
  postAdded,
  postDeleted,
  postSelectors,
  postUpdated,
  type PlatformId,
  type Post,
  type PostStatus,
  useAppDispatch,
  useAppSelector,
} from "./store";

const filters: Array<"all" | PostStatus> = [
  "all",
  "draft",
  "scheduled",
  "published",
];

const platformLabel: Record<PlatformId, string> = {
  linkedin: "in",
  instagram: "ig",
  x: "X",
  threads: "th",
};

export function PostPilot() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(postSelectors.selectAll);
  const platforms = useAppSelector(platformSelectors.selectAll);
  const loadStatus = useAppSelector((state) => state.posts.status);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Post | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (loadStatus === "idle") {
      dispatch(fetchPosts());
    }
  }, [dispatch, loadStatus]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          (filter === "all" || post.status === filter) &&
          `${post.title} ${post.content}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [posts, filter, query],
  );

  const counts = {
    all: posts.length,
    draft: posts.filter((post) => post.status === "draft").length,
    scheduled: posts.filter((post) => post.status === "scheduled").length,
    published: posts.filter((post) => post.status === "published").length,
  };

  function openNewPost() {
    setEditing(null);
    setComposerOpen(true);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <span>PostPilot</span>
        </div>

        <div className="nav-label">Menu</div>
        <nav aria-label="Main navigation">
          <button className="nav-item active">
            <LayoutDashboard size={17} />
            <span>Overview</span>
          </button>
          <button className="nav-item">
            <FileText size={17} />
            <span>Posts</span>
          </button>
          <button className="nav-item">
            <CalendarDays size={17} />
            <span>Calendar</span>
          </button>
          <button className="nav-item">
            <Grid2X2 size={17} />
            <span>Accounts</span>
          </button>
          <button className="nav-item">
            <Settings size={17} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-foot">
          <div className="user">
            <div className="avatar">AP</div>
            <div>
              <strong>Alex Parker</strong>
              <span>Content designer</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search">
            <Search size={17} />
            <input
              aria-label="Search posts"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts"
            />
          </div>
          <div className="actions">
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={17} />
            </button>
            <button className="primary" onClick={openNewPost}>
              <Plus size={16} />
              <span>New post</span>
            </button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <h1>Posts</h1>
              <p>Draft, schedule, and keep track of your social posts.</p>
            </div>
            <span>Wednesday, July 29</span>
          </div>

          <section className="stats" aria-label="Post summary">
            <Stat label="All posts" value={counts.all} />
            <Stat label="Drafts" value={counts.draft} />
            <Stat label="Scheduled" value={counts.scheduled} />
            <Stat label="Published" value={counts.published} />
          </section>

          <section className="posts-section">
            <div className="toolbar">
              <div>
                <h2>Recent posts</h2>
                <div className="result-count">
                  {visiblePosts.length}{" "}
                  {visiblePosts.length === 1 ? "post" : "posts"}
                </div>
              </div>
              <div className="filters" aria-label="Filter posts">
                {filters.map((item) => (
                  <button
                    key={item}
                    className={`filter ${filter === item ? "active" : ""}`}
                    onClick={() => setFilter(item)}
                  >
                    {item[0].toUpperCase() + item.slice(1)}
                    <span>{counts[item]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="post-grid">
              {loadStatus === "loading" ? (
                <div className="loading">
                  <div>
                    <div className="spinner" />
                    Loading posts...
                  </div>
                </div>
              ) : visiblePosts.length === 0 ? (
                <div className="empty">
                  <FileText size={25} />
                  <p>No posts found. Try a different filter or search.</p>
                </div>
              ) : (
                visiblePosts.map((post) => {
                  const platform = platforms.find(
                    (item) => item.id === post.platformId,
                  );

                  return (
                    <article className="card" key={post.id}>
                      <div className="card-top">
                        <div className="platform">
                          <span
                            className="platform-icon"
                            style={{ background: platform?.color }}
                          >
                            {platformLabel[post.platformId]}
                          </span>
                          <span>{platform?.name}</span>
                        </div>
                        <button
                          className="menu"
                          aria-label={`Actions for ${post.title}`}
                          onClick={() =>
                            setOpenMenu(openMenu === post.id ? null : post.id)
                          }
                        >
                          <MoreHorizontal size={19} />
                        </button>
                      </div>

                      {openMenu === post.id && (
                        <div className="card-actions">
                          <button
                            onClick={() => {
                              setEditing(post);
                              setComposerOpen(true);
                              setOpenMenu(null);
                            }}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            className="danger"
                            onClick={() => {
                              dispatch(postDeleted(post.id));
                              setOpenMenu(null);
                              setToast("Post deleted");
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}

                      <span className={`status ${post.status}`}>
                        {post.status}
                      </span>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                      <div className="card-foot">
                        <span>{platform?.handle}</span>
                        <span>{post.scheduledAt}</span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {composerOpen && (
        <Composer
          post={editing}
          onClose={() => setComposerOpen(false)}
          onSave={(message) => {
            setComposerOpen(false);
            setToast(message);
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Composer({
  post,
  onClose,
  onSave,
}: {
  post: Post | null;
  onClose: () => void;
  onSave: (message: string) => void;
}) {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector(platformSelectors.selectAll);
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [platformId, setPlatform] = useState<PlatformId>(
    post?.platformId ?? "linkedin",
  );
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");

  function submit(event: FormEvent) {
    event.preventDefault();
    const data = {
      title: title.trim(),
      content: content.trim(),
      platformId,
      status,
      scheduledAt:
        status === "draft" ? "Not scheduled" : "Aug 05, 10:00 AM",
    };

    if (post) {
      dispatch(postUpdated({ id: post.id, changes: data }));
    } else {
      dispatch(postAdded(data));
    }
    onSave(post ? "Post updated" : "Post created");
  }

  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <h2>{post ? "Edit post" : "New post"}</h2>
            <p>Add the details below. You can change them later.</p>
          </div>
          <button
            type="button"
            className="close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            required
            maxLength={80}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Post title"
          />
        </div>

        <div className="field">
          <label htmlFor="content">Post text</label>
          <textarea
            id="content"
            required
            maxLength={320}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your post"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              value={platformId}
              onChange={(event) =>
                setPlatform(event.target.value as PlatformId)
              }
            >
              {platforms.map((platform) => (
                <option value={platform.id} key={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as PostStatus)
              }
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            <Send size={15} />
            {post ? "Save changes" : "Create post"}
          </button>
        </div>
      </form>
    </div>
  );
}
