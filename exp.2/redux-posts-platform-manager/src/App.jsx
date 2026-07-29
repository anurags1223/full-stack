import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModalShell from "./components/ModalShell.jsx";
import PlatformManager from "./components/PlatformManager.jsx";
import PostModal from "./components/PostModal.jsx";
import StateInspector from "./components/StateInspector.jsx";
import {
  platformSelected,
  selectAllPlatforms,
  selectPlatformEntities,
  selectSelectedPlatformId,
} from "./features/platforms/platformsSlice.js";
import {
  fetchPosts,
  filtersCleared,
  postAdded,
  postDeleted,
  postStatusChanged,
  postUpdated,
  searchChanged,
  selectAllPosts,
  selectPostIds,
  selectVisiblePosts,
  statusFilterChanged,
} from "./features/posts/postsSlice.js";

const statusLabels = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

const nextStatusLabel = {
  draft: "Schedule",
  scheduled: "Publish",
  published: "Draft",
};

const formatDate = (value) => {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

function DeleteDialog({ onCancel, onConfirm, post }) {
  return (
    <ModalShell labelId="delete-modal-title" onClose={onCancel} size="compact">
      <div className="confirm-box">
        <h2 id="delete-modal-title">Delete post?</h2>
        <p>{post.title} will be removed from the post list.</p>
        <div className="modal-actions">
          <button className="button secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className="button danger" type="button" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </ModalShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const visiblePosts = useSelector(selectVisiblePosts);
  const postIds = useSelector(selectPostIds);
  const platforms = useSelector(selectAllPlatforms);
  const platformEntities = useSelector(selectPlatformEntities);
  const selectedPlatformId = useSelector(selectSelectedPlatformId);
  const statusFilter = useSelector((state) => state.posts.statusFilter);
  const search = useSelector((state) => state.posts.search);
  const loading = useSelector((state) => state.posts.loading);
  const error = useSelector((state) => state.posts.error);
  const lastSynced = useSelector((state) => state.posts.lastSynced);
  const activity = useSelector((state) => state.activity.logs);

  const [postModal, setPostModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [notice, setNotice] = useState("");

  const counts = useMemo(
    () =>
      posts.reduce(
        (result, post) => {
          result[post.status] += 1;
          result[post.platformId] = (result[post.platformId] || 0) + 1;
          return result;
        },
        { draft: 0, scheduled: 0, published: 0 },
      ),
    [posts],
  );

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const savePost = (form) => {
    const payload = {
      ...form,
      publishAt:
        form.status === "draft"
          ? null
          : form.status === "published" && postModal?.status !== "published"
            ? new Date().toISOString()
            : form.publishAt,
    };

    if (postModal?.id) {
      dispatch(postUpdated({ id: postModal.id, changes: payload }));
      setNotice("Post updated");
    } else {
      dispatch(postAdded(payload));
      setNotice("Post created");
    }
    setPostModal(null);
  };

  const syncPosts = async () => {
    const result = await dispatch(fetchPosts());
    setNotice(fetchPosts.fulfilled.match(result) ? "Posts synced" : "Sync failed");
  };

  const clearFilters = () => {
    dispatch(filtersCleared());
    dispatch(platformSelected("all"));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="label">Posts Platform Manager</p>
          <h1>Manage posts</h1>
        </div>
        <div className="header-actions">
          <button className="button secondary" type="button" onClick={() => setShowPlatforms(true)}>Platforms</button>
          <button className="button secondary" type="button" onClick={syncPosts} disabled={loading === "pending"}>
            {loading === "pending" ? "Syncing" : "Sync"}
          </button>
          <button className="button primary" type="button" onClick={() => setPostModal({ mode: "create" })}>New post</button>
        </div>
      </header>

      <main className="layout">
        <section className="main-panel">
          <div className="stats-row">
            <Stat label="Total" value={posts.length} />
            <Stat label="Draft" value={counts.draft} />
            <Stat label="Scheduled" value={counts.scheduled} />
            <Stat label="Published" value={counts.published} />
          </div>

          <div className="toolbar">
            <label className="search-box">
              <span>Search</span>
              <input value={search} onChange={(event) => dispatch(searchChanged(event.target.value))} placeholder="Title, content, or author" />
            </label>
            <label>
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => dispatch(statusFilterChanged(event.target.value))}>
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label>
              <span>Platform</span>
              <select value={selectedPlatformId} onChange={(event) => dispatch(platformSelected(event.target.value))}>
                <option value="all">All platforms</option>
                {platforms.map((platform) => (
                  <option value={platform.id} key={platform.id}>{platform.name}</option>
                ))}
              </select>
            </label>
            <button className="button ghost" type="button" onClick={clearFilters}>Clear</button>
          </div>

          {error && <div className="notice error" role="alert">{error}</div>}
          {lastSynced && <p className="sync-line">Last sync: {formatDate(lastSynced)}</p>}

          <div className="post-list">
            {visiblePosts.map((post) => {
              const platform = platformEntities[post.platformId];
              return (
                <article className="post-row" key={post.id}>
                  <div className="post-color" style={{ background: platform?.color || "#9ca3af" }} />
                  <div className="post-body">
                    <div className="post-title-line">
                      <h2>{post.title}</h2>
                      <span className={`status ${post.status}`}>{statusLabels[post.status]}</span>
                    </div>
                    <p>{post.content}</p>
                    <div className="post-meta">
                      <span>{platform?.name || "Unknown platform"}</span>
                      <span>{post.author}</span>
                      <span>{formatDate(post.publishAt)}</span>
                      <span>{post.reactions} reactions</span>
                    </div>
                  </div>
                  <div className="row-actions">
                    <button className="button small" type="button" onClick={() => dispatch(postStatusChanged(post.id))}>{nextStatusLabel[post.status]}</button>
                    <button className="button small" type="button" onClick={() => setPostModal(post)}>Edit</button>
                    <button className="button small danger-soft" type="button" onClick={() => setDeleteTarget(post)}>Delete</button>
                  </div>
                </article>
              );
            })}
          </div>

          {visiblePosts.length === 0 && (
            <div className="empty-state">
              <h2>No posts found</h2>
              <p>Change the filters or create a new post.</p>
              <button className="button primary" type="button" onClick={() => setPostModal({ mode: "create" })}>New post</button>
            </div>
          )}
        </section>

        <StateInspector activity={activity} postIds={postIds} posts={posts} />
      </main>

      {postModal && (
        <PostModal
          key={postModal.id || "new"}
          post={postModal.id ? postModal : null}
          platforms={platforms}
          onClose={() => setPostModal(null)}
          onSave={savePost}
        />
      )}
      {showPlatforms && <PlatformManager platforms={platforms} posts={posts} onClose={() => setShowPlatforms(false)} />}
      {deleteTarget && (
        <DeleteDialog
          post={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            dispatch(postDeleted(deleteTarget.id));
            setNotice("Post deleted");
            setDeleteTarget(null);
          }}
        />
      )}
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  );
}

export default App;
