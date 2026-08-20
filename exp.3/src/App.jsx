import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  HashRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import { Provider } from "react-redux";
import ExperimentOne from "./experiments/experiment1/App.jsx";
import experimentOneStyles from "./experiments/experiment1/scoped.css?raw";
import ExperimentTwo from "./experiments/experiment2/App.jsx";
import { store as experimentTwoStore } from "./experiments/experiment2/app/store.js";
import experimentTwoStyles from "./experiments/experiment2/scoped.css?raw";

const EXPERIMENT_ONE_STYLES = experimentOneStyles + `
.experiment-one-root .profile-signout{margin-left:auto;border:1px solid #444453;background:#242431;color:#fff;border-radius:7px;padding:7px 8px;font-size:9px;font-weight:700;cursor:pointer;white-space:nowrap}
.experiment-one-root .profile-signout:hover{border-color:#7157f6;background:#302b51}
`;
const EXPERIMENT_TWO_STYLES = experimentTwoStyles + `
.experiment-two-root .session-chip{display:grid;gap:2px;margin-right:4px;padding-right:13px;border-right:1px solid var(--line);text-align:right}
.experiment-two-root .session-chip strong{font-size:12px}.experiment-two-root .session-chip small{color:var(--muted);font-size:10px}
.experiment-two-root .signout-button{color:#991b1b}
@media(max-width:680px){.experiment-two-root .session-chip{order:-1;width:100%;margin:0;padding:0 0 9px;border-right:0;border-bottom:1px solid var(--line);text-align:left}}
`;const permissions = {
  Admin: ["read", "create", "edit", "delete", "manage"],
  Editor: ["read", "create", "edit"],
  Viewer: ["read"]
};
const descriptions = {
  Admin: "Full access to content, people, and controls",
  Editor: "Create and edit content without deletion rights",
  Viewer: "Read-only access to published work"
};
const accounts = [
  { id: "usr_admin_01", username: "admin", password: "admin123", name: "Aanya Rao", role: "Admin", avatar: "AR" },
  { id: "usr_editor_01", username: "editor", password: "editor123", name: "Ethan Cole", role: "Editor", avatar: "EC" },
  { id: "usr_viewer_01", username: "view", password: "view123", name: "Mira Sen", role: "Viewer", avatar: "MS" }
];
const titles = [
  "Designing calm digital workspaces",
  "A practical guide to editorial rhythm",
  "Why clear permissions build trust",
  "Five ways to improve content reviews",
  "The quiet power of a useful draft",
  "Building a sustainable publishing habit",
  "How teams make better decisions",
  "A field guide to meaningful metrics",
  "Security principles for product teams",
  "From rough note to finished story",
  "Editing with empathy and precision",
  "The anatomy of a strong headline",
  "Planning content without the chaos",
  "What readers notice first",
  "A simple framework for better briefs",
  "Making feedback easier to act on",
  "Writing interfaces people understand",
  "The small details behind great work",
  "How to keep a content library healthy",
  "A smarter approach to publishing cadence",
  "Creating a consistent editorial voice",
  "When a draft is ready to publish"
];
const seedPosts = titles.map(function(title, index) {
  const admin = index < 10;
  return {
    id: index + 1,
    title,
    excerpt: "A focused, practical note for teams who want to publish thoughtful work with less friction.",
    author: admin ? "Aanya Rao" : "Ethan Cole",
    authorRole: admin ? "Admin" : "Editor",
    status: [3, 7, 13, 17, 21].includes(index) ? "Draft" : "Published",
    date: "Aug " + String(5 - index % 5).padStart(2, "0") + ", 2026"
  };
});
const TOKEN_KEY = "postflow_demo_token";
const POSTS_KEY = "postflow_demo_posts";
function encode(value) {
  return btoa(typeof value === "string" ? value : JSON.stringify(value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function decode(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  return atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
}
function createToken(user) {
  const now = Math.floor(Date.now() / 1e3);
  const claims = {
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: permissions[user.role],
    iat: now,
    exp: now + 7200
  };
  const unsigned = encode({ alg: "HS256", typ: "JWT", demo: true }) + "." + encode(claims);
  return unsigned + "." + encode("demo-signature:" + unsigned.slice(-12));
}
function readToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const claims = JSON.parse(decode(parts[1]));
    if (claims.exp <= Math.floor(Date.now() / 1e3)) return null;
    return accounts.some(function(item) {
      return item.id === claims.sub;
    }) ? claims : null;
  } catch {
    return null;
  }
}
const AuthContext = createContext(null);
function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Missing AuthProvider");
  return value;
}
function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(function() {
    const saved = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    const claims = saved ? readToken(saved) : null;
    if (saved && claims) {
      setToken(saved);
      setUser(claims);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    setReady(true);
  }, []);
  function login(username, password, remember) {
    const match = accounts.find(function(item) {
      return item.username === username.trim().toLowerCase() && item.password === password;
    });
    if (!match) return false;
    const next = createToken(match);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, next);
    setToken(next);
    setUser(readToken(next));
    return true;
  }
  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }
  function can(permission) {
    return Boolean(user && user.permissions.includes(permission));
  }
  return <AuthContext.Provider value={{ token, user, ready, login, logout, can }}>{children}</AuthContext.Provider>;
}
function Guard({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    window.setTimeout(function() {
      if (login(username, password, remember)) {
        const state = location.state;
        navigate(state && state.from || "/dashboard", { replace: true });
      } else {
        setError("That username or password does not match.");
        setBusy(false);
      }
    }, 420);
  }
  function fill(account) {
    setUsername(account.username);
    setPassword(account.password);
    setError("");
  }
  return <main className="login-page">
      <section className="login-story">
        <div className="brand brand-light"><span className="brand-mark">P</span><span>PostFlow</span></div>
        <div className="story-copy">
          <span className="eyebrow">Authentication x Authorization</span>
          <h1>Publish with clarity. Control with confidence.</h1>
          <p>A hands-on React workspace for understanding dummy JWT sessions, protected routes, and role-based permissions.</p>
          <div className="flow-line"><span>Sign in</span><i>&rarr;</i><span>Receive token</span><i>&rarr;</i><span>Access by role</span></div>
        </div>
        <div className="story-foot">
          <div className="story-stat"><strong>3</strong><span>purposeful roles</span></div>
          <div className="story-stat"><strong>100%</strong><span>client-side demo</span></div>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand"><span className="brand-mark">P</span><span>PostFlow</span></div>
          <span className="eyebrow eyebrow-dark">Welcome back</span>
          <h2>Sign in to your workspace</h2>
          <p className="muted">Choose a demo account or enter its credentials.</p>
          <div className="demo-accounts">
            {accounts.map(function(account) {
    return <button type="button" key={account.id} onClick={function() {
      fill(account);
    }} className={"demo-account role-" + account.role.toLowerCase()}>
                  <span className="avatar avatar-small">{account.avatar}</span>
                  <span><strong>{account.role}</strong><small>{account.username} / {account.password}</small></span>
                </button>;
  })}
          </div>
          <form className="login-form" onSubmit={submit}>
            <label><span>Username</span><input autoComplete="username" required placeholder="e.g. admin" value={username} onChange={function(e) {
    setUsername(e.target.value);
  }} /></label>
            <label><span>Password</span><span className="password-field">
              <input autoComplete="current-password" required type={show ? "text" : "password"} placeholder="Enter password" value={password} onChange={function(e) {
    setPassword(e.target.value);
  }} />
              <button type="button" onClick={function() {
    setShow(!show);
  }}>{show ? "Hide" : "Show"}</button>
            </span></label>
            <label className="remember-row"><input type="checkbox" checked={remember} onChange={function(e) {
    setRemember(e.target.checked);
  }} /><span>Remember me on this device</span></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button button-primary button-full" disabled={busy}>{busy ? "Verifying..." : "Sign in securely"}</button>
          </form>
          <p className="demo-note"><span>i</span>Educational demo only. Passwords and signatures are simulated in the browser.</p>
        </div>
      </section>
    </main>;
}
const nav = [
  { to: "/dashboard", label: "Overview", icon: "O" },
  { to: "/posts", label: "All posts", icon: "P" },
  { to: "/team", label: "People & roles", icon: "R", admin: true },
  { to: "/settings", label: "Session details", icon: "S" }
];
function Shell({ children }) {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(false);
  const [mobile, setMobile] = useState(false);
  if (!user) return null;
  const current = nav.find(function(item) {
    return location.pathname.startsWith(item.to);
  });
  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }
  return <div className="app-frame">
      <aside className={"sidebar " + (mobile ? "sidebar-open" : "")}>
        <div className="sidebar-top"><div className="brand"><span className="brand-mark">P</span><span>PostFlow</span></div><button className="mobile-close" onClick={function() {
    setMobile(false);
  }}>&times;</button></div>
        <nav className="main-nav">
          <span className="nav-caption">Workspace</span>
          {nav.filter(function(item) {
    return !item.admin || user.role === "Admin";
  }).map(function(item) {
    return <NavLink key={item.to} to={item.to} onClick={function() {
      setMobile(false);
    }} className={function(state) {
      return state.isActive ? "nav-active" : "";
    }}><span className="nav-icon">{item.icon}</span>{item.label}</NavLink>;
  })}
        </nav>
        <div className="sidebar-callout">
          <span className="callout-symbol">*</span><strong>Your access</strong><p>{descriptions[user.role]}.</p>
          <div className="permission-dots">{user.permissions.map(function(item) {
    return <span key={item}>{item}</span>;
  })}</div>
        </div>
        <p className="sidebar-footer">React + dummy JWT / v1.0</p>
      </aside>+      {mobile && <button className="nav-scrim" onClick={function() {
    setMobile(false);
  }} aria-label="Close navigation" />}
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-title"><button className="menu-button" onClick={function() {
    setMobile(true);
  }}>Menu</button><div><span className="breadcrumb">PostFlow /</span><strong>{current ? current.label : "Workspace"}</strong></div></div>
          <div className="topbar-actions">
            {can("create") && <button className="button button-primary button-compact" onClick={function() {
    navigate("/posts/new");
  }}>+ New post</button>}
            <div className="profile-wrap">
              <button className="profile-button" onClick={function() {
    setProfile(!profile);
  }}>
                <span className="avatar">{accounts.find(function(item) {
    return item.id === user.sub;
  })?.avatar}</span>
                <span className="profile-copy"><strong>{user.name}</strong><small>{user.role}</small></span><span>v</span>
              </button>
              {profile && <div className="profile-menu"><span>Signed in as <strong>{user.username}</strong></span><button onClick={function() {
    navigate("/settings");
    setProfile(false);
  }}>Session details</button><button className="danger-text" onClick={signOut}>Sign out</button></div>}
            </div>
          </div>
        </header>
        <div className="page-scroll">{children}</div>
      </div>
    </div>;
}
function Dashboard({ posts }) {
  const { user, can } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const published = posts.filter(function(post) {
    return post.status === "Published";
  }).length;
  const admin = posts.filter(function(post) {
    return post.authorRole === "Admin";
  }).length;
  const editor = posts.filter(function(post) {
    return post.authorRole === "Editor";
  }).length;
  return <main className="page">
      <section className="welcome-row"><div><span className="eyebrow eyebrow-dark">Thursday, August 6</span><h1>Good morning, {user.name.split(" ")[0]}.</h1><p>Here is the shape of your publishing workspace today.</p></div><span className={"role-badge role-" + user.role.toLowerCase()}>{user.role} access</span></section>
      <section className="metric-grid">
        <article className="metric-card metric-total"><div className="metric-icon">A</div><span>All posts</span><strong>{posts.length}</strong><small>Across the whole workspace</small></article>
        <article className="metric-card"><div className="metric-icon icon-green">P</div><span>Published</span><strong>{published}</strong><small>{Math.round(published / posts.length * 100)}% of all content</small></article>
        <article className="metric-card"><div className="metric-icon icon-coral">D</div><span>In draft</span><strong>{posts.length - published}</strong><small>Waiting for a final review</small></article>
        <article className="metric-card"><div className="metric-icon icon-lilac">K</div><span>Your permissions</span><strong>{user.permissions.length}</strong><small>{descriptions[user.role]}</small></article>
      </section>
      <section className="dashboard-grid">
        <article className="content-card recent-card">
          <div className="section-heading"><div><span className="eyebrow eyebrow-dark">Latest activity</span><h2>Recent posts</h2></div><button className="text-button" onClick={function() {
    navigate("/posts");
  }}>View all &rarr;</button></div>
          <div className="recent-list">{posts.slice(-4).reverse().map(function(post) {
    return <button className="recent-item" key={post.id} onClick={function() {
      if (can("edit")) navigate("/posts/" + post.id + "/edit");
      else navigate("/posts");
    }}><span className={"post-dot " + post.status.toLowerCase()} /><span className="recent-copy"><strong>{post.title}</strong><small>{post.author} / {post.date}</small></span><span className={"status-badge status-" + post.status.toLowerCase()}>{post.status}</span><span className="row-arrow">&rsaquo;</span></button>;
  })}</div>
        </article>
        <article className="content-card authors-card">
          <div className="section-heading"><div><span className="eyebrow eyebrow-dark">Authorship</span><h2>Created by role</h2></div></div>
          <div className="author-summary"><div className="author-visual"><span className="visual-total">{posts.length}</span><small>posts</small></div><div className="author-legend">
            <div><span className="legend-swatch swatch-admin" /><span><strong>Admin</strong><small>Aanya Rao</small></span><b>{admin}</b></div>
            <div><span className="legend-swatch swatch-editor" /><span><strong>Editor</strong><small>Ethan Cole</small></span><b>{editor}</b></div>
            <div><span className="legend-swatch swatch-viewer" /><span><strong>Viewer</strong><small>Read only</small></span><b>0</b></div>
          </div></div>
          <div className="access-note"><span>i</span><p>You are seeing controls for <strong>{user.role}</strong>. The interface hides actions your token does not permit.</p></div>
        </article>
      </section>
    </main>;
}
function Posts({ posts, remove }) {
  const { can, user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [target, setTarget] = useState(null);
  const [page, setPage] = useState(1);
  const filtered = useMemo(function() {
    return posts.filter(function(post) {
      return (status === "All" || post.status === status) && (post.title + " " + post.author).toLowerCase().includes(query.toLowerCase());
    });
  }, [posts, query, status]);
  const pageSize = 7, pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  return <main className="page">
      <section className="page-heading"><div><span className="eyebrow eyebrow-dark">Content library</span><h1>All posts</h1><p>Search, review, and manage every story in the workspace.</p></div>{can("create") && <button className="button button-primary" onClick={function() {
    navigate("/posts/new");
  }}>+ Create post</button>}</section>
      <section className="content-card post-library">
        <div className="library-toolbar">
          <label className="search-box"><span>S</span><input placeholder="Search title or author..." value={query} onChange={function(e) {
    setQuery(e.target.value);
    setPage(1);
  }} /></label>
          <div className="filter-tabs">{["All", "Published", "Draft"].map(function(item) {
    return <button key={item} className={status === item ? "filter-active" : ""} onClick={function() {
      setStatus(item);
      setPage(1);
    }}>{item}</button>;
  })}</div>
        </div>
        <div className="table-wrap"><table><thead><tr><th>Post</th><th>Author</th><th>Status</th><th>Updated</th>{(can("edit") || can("delete")) && <th className="actions-cell">Actions</th>}</tr></thead><tbody>
          {visible.map(function(post) {
    return <tr key={post.id}>
              <td><div className="post-title-cell"><span className="post-index">{String(post.id).padStart(2, "0")}</span><span><strong>{post.title}</strong><small>{post.excerpt}</small></span></div></td>
              <td><span className="author-cell"><span className="avatar avatar-tiny">{post.author.split(" ").map(function(part) {
      return part[0];
    }).join("")}</span><span><strong>{post.author}</strong><small>{post.authorRole}</small></span></span></td>
              <td><span className={"status-badge status-" + post.status.toLowerCase()}>{post.status}</span></td><td className="date-cell">{post.date}</td>
              {(can("edit") || can("delete")) && <td className="actions-cell"><div className="row-actions">{can("edit") && <button className="icon-button" onClick={function() {
      navigate("/posts/" + post.id + "/edit");
    }}>Edit</button>}{can("delete") && <button className="icon-button danger-text" onClick={function() {
      setTarget(post);
    }}>Delete</button>}</div></td>}
            </tr>;
  })}</tbody></table></div>
        {!visible.length && <div className="empty-state"><span>S</span><h3>No posts found</h3><p>Try another search or status filter.</p></div>}
        <div className="table-footer"><span>Showing {visible.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered.length)} of {filtered.length} posts</span><div className="pagination"><button disabled={page === 1} onClick={function() {
    setPage(page - 1);
  }}>&larr;</button>{Array.from({ length: pages }, function(_, i) {
    return i + 1;
  }).map(function(item) {
    return <button key={item} className={page === item ? "page-active" : ""} onClick={function() {
      setPage(item);
    }}>{item}</button>;
  })}<button disabled={page === pages} onClick={function() {
    setPage(page + 1);
  }}>&rarr;</button></div></div>
      </section>
      {user && user.role === "Editor" && <div className="permission-banner"><span>i</span><div><strong>Editor protection is active</strong><p>Delete controls are intentionally removed for your role.</p></div></div>}
      {target && <div className="modal-backdrop"><div className="confirm-dialog" role="dialog" aria-modal="true"><span className="confirm-symbol">!</span><h2>Delete this post?</h2><p>&quot;{target.title}&quot; will be removed from this browser&apos;s demo content.</p><div className="dialog-actions"><button className="button button-secondary" onClick={function() {
    setTarget(null);
  }}>Keep post</button><button className="button button-danger" onClick={function() {
    remove(target.id);
    setTarget(null);
  }}>Delete post</button></div></div></div>}
    </main>;
}
function PostForm({ posts, save }) {
  const { user, can } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = id ? posts.find(function(post) {
    return post.id === Number(id);
  }) : void 0;
  const [title, setTitle] = useState(existing ? existing.title : "");
  const [excerpt, setExcerpt] = useState(existing ? existing.excerpt : "");
  const [status, setStatus] = useState(existing ? existing.status : "Draft");
  if (!user) return null;
  if (!can(existing ? "edit" : "create")) return <Navigate to="/unauthorized" replace />;
  if (id && !existing) return <Navigate to="/posts" replace />;
  function submit(event) {
    event.preventDefault();
    save({
      id: existing ? existing.id : Math.max.apply(null, posts.map(function(post) {
        return post.id;
      }).concat(0)) + 1,
      title: title.trim(),
      excerpt: excerpt.trim(),
      author: existing ? existing.author : user.name,
      authorRole: existing ? existing.authorRole : user.role,
      status,
      date: "Aug 06, 2026"
    });
    navigate("/posts");
  }
  return <main className="page editor-page">
      <button className="back-button" onClick={function() {
    navigate("/posts");
  }}>&larr; Back to posts</button>
      <section className="page-heading editor-heading"><div><span className="eyebrow eyebrow-dark">{existing ? "Update story" : "New story"}</span><h1>{existing ? "Edit post" : "Create a post"}</h1><p>{existing ? "Refine the content and publication state." : "Turn a clear idea into a useful piece of content."}</p></div></section>
      <form className="editor-layout" onSubmit={submit}>
        <section className="content-card editor-form-card"><label><span>Post title</span><input required minLength={4} placeholder="Give your story a clear title" value={title} onChange={function(e) {
    setTitle(e.target.value);
  }} /></label><label><span>Summary</span><textarea required minLength={12} rows={8} placeholder="What should readers know?" value={excerpt} onChange={function(e) {
    setExcerpt(e.target.value);
  }} /><small>{excerpt.length} characters</small></label></section>
        <aside className="content-card publish-card"><span className="eyebrow eyebrow-dark">Publication</span><h2>Ready when you are</h2><label><span>Status</span><select value={status} onChange={function(e) {
    setStatus(e.target.value);
  }}><option>Draft</option><option>Published</option></select></label><div className="author-preview"><span className="avatar">{accounts.find(function(item) {
    return item.id === user.sub;
  })?.avatar}</span><span><small>{existing ? "Original author" : "Author"}</small><strong>{existing ? existing.author : user.name}</strong></span></div><p className="publish-note">This action is allowed by the <strong>{user.role}</strong> role in your decoded token.</p><button className="button button-primary button-full">{existing ? "Save changes" : "Create post"}</button><button type="button" className="button button-quiet button-full" onClick={function() {
    navigate("/posts");
  }}>Cancel</button></aside>
      </form>
    </main>;
}
function Team({ posts }) {
  return <main className="page">
      <section className="page-heading"><div><span className="eyebrow eyebrow-dark">Admin only</span><h1>People & roles</h1><p>See how permissions and authorship differ across the team.</p></div></section>
      <section className="role-grid">{accounts.map(function(member) {
    const count = posts.filter(function(post) {
      return post.author === member.name;
    }).length;
    return <article className="content-card role-card" key={member.id}><div className="role-card-head"><span className="avatar avatar-large">{member.avatar}</span><span className={"role-badge role-" + member.role.toLowerCase()}>{member.role}</span></div><h2>{member.name}</h2><p>@{member.username}</p><div className="member-count"><strong>{count}</strong><span>posts created</span></div><div className="role-permissions">{permissions[member.role].map(function(item) {
      return <span key={item}>+ {item}</span>;
    })}</div></article>;
  })}</section>
      <section className="content-card matrix-card"><div className="section-heading"><div><span className="eyebrow eyebrow-dark">Access matrix</span><h2>Permissions at a glance</h2></div></div><div className="matrix"><div className="matrix-row matrix-head"><span>Role</span><span>Read</span><span>Create</span><span>Edit</span><span>Delete</span></div>{["Admin", "Editor", "Viewer"].map(function(role) {
    return <div className="matrix-row" key={role}><strong>{role}</strong>{["read", "create", "edit", "delete"].map(function(item) {
      const yes = permissions[role].includes(item);
      return <span key={item} className={yes ? "allowed" : "denied"}>{yes ? "Yes" : "-"}</span>;
    })}</div>;
  })}</div></section>
    </main>;
}
function Session() {
  const { token, user } = useAuth();
  const [show, setShow] = useState(false);
  if (!token || !user) return null;
  const storage = localStorage.getItem(TOKEN_KEY) ? "localStorage" : "sessionStorage";
  return <main className="page">
      <section className="page-heading"><div><span className="eyebrow eyebrow-dark">Session & token</span><h1>How your access works</h1><p>Inspect the decoded claims powering this educational session.</p></div></section>
      <section className="settings-grid">
        <article className="content-card token-card"><div className="section-heading"><div><span className="eyebrow eyebrow-dark">Dummy JWT</span><h2>Decoded payload</h2></div><span className="live-badge"><i /> Active</span></div><div className="claim-grid"><div><span>Subject</span><strong>{user.sub}</strong></div><div><span>Username</span><strong>{user.username}</strong></div><div><span>Role</span><strong>{user.role}</strong></div><div><span>Expires</span><strong>{new Date(user.exp * 1e3).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></div></div><div className="token-permissions"><span>Permissions</span><div>{user.permissions.map(function(item) {
    return <b key={item}>{item}</b>;
  })}</div></div><button className="text-button token-toggle" onClick={function() {
    setShow(!show);
  }}>{show ? "Hide raw token" : "Show raw token"}</button>{show && <code className="raw-token">{token}</code>}</article>
        <aside className="content-card session-card"><span className="session-icon">S</span><span className="eyebrow eyebrow-dark">Storage</span><h2>{storage}</h2><p>{storage === "sessionStorage" ? "This session ends when the browser tab is closed." : "Remember me is active, so this demo session persists on this device."}</p><div className="session-rule"><span>Issued</span><strong>{new Date(user.iat * 1e3).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></div><div className="session-rule"><span>Lifetime</span><strong>2 hours</strong></div></aside>
      </section>
      <section className="security-strip"><span className="security-symbol">!</span><div><strong>Important security note</strong><p>This token is intentionally simulated. A production app must issue and verify signed JWTs on a trusted server, avoid sensitive payload data, use short expiries, and prefer secure HttpOnly cookies where appropriate.</p></div></section>
    </main>;
}
function Denied() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return <main className="center-state"><span className="state-code">403</span><h1>This route needs a different role.</h1><p>Your {user ? user.role : ""} token is valid, but it does not include permission for this page.</p><button className="button button-primary" onClick={function() {
    navigate("/dashboard");
  }}>Return to overview</button></main>;
}
function RoleWorkspace({ posts, remove, save }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }
  if (user.role === "Admin") {
    return <><style>{EXPERIMENT_ONE_STYLES}</style><ExperimentOne sessionUser={user} onSignOut={signOut} /></>;
  }
  if (user.role === "Editor") {
    return <><style>{EXPERIMENT_TWO_STYLES}</style><Provider store={experimentTwoStore}><ExperimentTwo sessionUser={user} onSignOut={signOut} /></Provider></>;
  }
  return <Shell><Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard posts={posts} />} />
      <Route path="/posts" element={<Posts posts={posts} remove={remove} />} />
      <Route path="/posts/new" element={<PostForm posts={posts} save={save} />} />
      <Route path="/posts/:id/edit" element={<PostForm posts={posts} save={save} />} />
      <Route path="/settings" element={<Session />} />
      <Route path="/unauthorized" element={<Denied />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes></Shell>;
}
function Workspace() {
  const [posts, setPosts] = useState(seedPosts);
  const [loaded, setLoaded] = useState(false);
  useEffect(function() {
    const saved = localStorage.getItem(POSTS_KEY);
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch {
        setPosts(seedPosts);
      }
    }
    setLoaded(true);
  }, []);
  useEffect(function() {
    if (loaded) localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }, [posts, loaded]);
  function save(next) {
    setPosts(function(current) {
      return current.some(function(post) {
        return post.id === next.id;
      }) ? current.map(function(post) {
        return post.id === next.id ? next : post;
      }) : current.concat(next);
    });
  }
  function remove(id) {
    setPosts(function(current) {
      return current.filter(function(post) {
        return post.id !== id;
      });
    });
  }
  return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Guard><RoleWorkspace posts={posts} remove={remove} save={save} /></Guard>} />
    </Routes>;
}
function Gate() {
  const { ready } = useAuth();
  return ready ? <Workspace /> : <main className="app-loading"><span className="brand-mark">P</span><span>Checking your session...</span></main>;
}
function PostFlowApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(function() {
    setMounted(true);
  }, []);
  if (!mounted) return <main className="app-loading"><span className="brand-mark">P</span><span>Preparing your workspace...</span></main>;
  return <HashRouter><AuthProvider><Gate /></AuthProvider></HashRouter>;
}
export {
  PostFlowApp as default
};
