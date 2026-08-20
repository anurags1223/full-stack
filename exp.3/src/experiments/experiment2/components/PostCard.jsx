import Icon from "./Icon.jsx";
import PlatformMark from "./PlatformMark.jsx";

const statusLabels = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

const actionLabels = {
  draft: "Schedule",
  scheduled: "Publish",
  published: "Move to draft",
};

const formatDate = (value) => {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

function PostCard({ post, platform, onAdvance, onDelete, onEdit }) {
  return (
    <article className="post-card">
      <span
        aria-hidden="true"
        className="post-accent"
        style={{ "--platform-color": platform?.color || "#aab3ad" }}
      />

      <div className="post-card-top">
        <div className="platform-identity">
          <PlatformMark platform={platform} />
          <span>
            <strong>{platform?.name || "Unknown platform"}</strong>
            <small>{platform?.handle || "Missing relation"}</small>
          </span>
        </div>
        <span className={`status-pill ${post.status}`}>
          <i /> {statusLabels[post.status]}
        </span>
      </div>

      <div className="post-copy">
        <h3>{post.title}</h3>
        <p>{post.content}</p>
      </div>

      <dl className="post-meta">
        <div>
          <dt>{post.status === "published" ? "Published" : "Target"}</dt>
          <dd>{formatDate(post.publishAt)}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{post.author}</dd>
        </div>
      </dl>

      <div className="post-card-bottom">
        <div className="engagement" aria-label="Post engagement">
          <span><Icon name="heart" size={14} />{post.reactions}</span>
          <span><Icon name="comment" size={14} />{post.comments}</span>
        </div>
        <div className="card-actions">
          <button className="advance-button" type="button" onClick={onAdvance}>
            {actionLabels[post.status]} <Icon name="chevron" size={13} />
          </button>
          <button className="icon-button" type="button" onClick={onEdit} aria-label={`Edit ${post.title}`} title="Edit post">
            <Icon name="edit" size={15} />
          </button>
          <button className="icon-button danger" type="button" onClick={onDelete} aria-label={`Delete ${post.title}`} title="Delete post">
            <Icon name="trash" size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
