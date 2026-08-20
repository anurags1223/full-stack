import { useState } from "react";

function StateInspector({ activity, postIds, posts }) {
  const [view, setView] = useState("shape");

  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <div>
          <p className="label">Redux state</p>
          <h2>Inspector</h2>
        </div>
        <span className="live-badge">Live</span>
      </div>

      <div className="inspector-tabs" role="tablist" aria-label="State inspector views">
        <button className={view === "shape" ? "active" : ""} type="button" role="tab" aria-selected={view === "shape"} onClick={() => setView("shape")}>
          Shape
        </button>
        <button className={view === "activity" ? "active" : ""} type="button" role="tab" aria-selected={view === "activity"} onClick={() => setView("activity")}>
          Activity
        </button>
      </div>

      {view === "shape" ? (
        <>
          <div className="state-block">
            <div className="state-summary">
              <span>posts</span>
              <small>{posts.length} entities</small>
            </div>
            <div className="code-row"><b>ids</b><code>[{postIds.slice(0, 2).map((id) => `"${id}"`).join(", ")}{postIds.length > 2 ? ", ..." : ""}]</code></div>
            <div className="code-row"><b>entities</b><code>{"{"}</code></div>
            <div className="entity-preview">
              {postIds.slice(0, 4).map((id) => (
                <div key={id}>
                  <b>{id}</b>
                  <code>{posts.find((post) => post.id === id)?.status}</code>
                </div>
              ))}
            </div>
            <div className="code-row"><b /> <code>{"}"}</code></div>
          </div>
          <div className="relation-card">
            <strong>Relation</strong>
            <p>Each post stores a platform ID. Platform details are stored once in the platform slice.</p>
          </div>
        </>
      ) : (
        <div className="activity-list">
          {activity.map((item) => (
            <div className="activity-item" key={item.id}>
              <span>
                <strong>{item.message}</strong>
                <code>{item.actionType}</code>
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="inspector-footnote">
        <strong>Store behavior</strong>
        Actions update the Redux store, selectors rebuild this view, and connected components refresh together.
      </p>
    </aside>
  );
}

export default StateInspector;
