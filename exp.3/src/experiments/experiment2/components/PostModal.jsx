import { useState } from "react";
import ModalShell from "./ModalShell.jsx";

const toLocalDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function PostModal({ onClose, onSave, platforms, post }) {
  const [form, setForm] = useState(() => ({
    title: post?.title || "",
    content: post?.content || "",
    author: post?.author || "Maya Chen",
    platformId: post?.platformId || platforms[0]?.id || "",
    status: post?.status || "draft",
    publishAt: toLocalDateTime(post?.publishAt),
  }));

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const publishAt =
      form.status === "scheduled" && form.publishAt
        ? new Date(form.publishAt).toISOString()
        : post?.publishAt || null;
    onSave({ ...form, publishAt });
  };

  return (
    <ModalShell labelId="post-modal-title" onClose={onClose}>
      <header className="modal-header">
        <p className="label">Post</p>
        <h2 id="post-modal-title">{post ? "Edit post" : "New post"}</h2>
        <p>{post ? "Update the selected post." : "Create a post for one platform."}</p>
      </header>

      {platforms.length === 0 ? (
        <div className="empty-modal">
          <p>Add a platform before creating posts.</p>
          <button className="button secondary" type="button" onClick={onClose}>Close</button>
        </div>
      ) : (
        <form className="entity-form" onSubmit={submit}>
          <label>
            Title
            <input autoFocus name="title" value={form.title} onChange={updateField} required maxLength="80" />
          </label>

          <label>
            Content
            <textarea name="content" value={form.content} onChange={updateField} required maxLength="280" />
            <small>{form.content.length}/280</small>
          </label>

          <div className="form-grid">
            <label>
              Author
              <input name="author" value={form.author} onChange={updateField} required maxLength="50" />
            </label>
            <label>
              Platform
              <select name="platformId" value={form.platformId} onChange={updateField} required>
                {platforms.map((platform) => (
                  <option value={platform.id} key={platform.id}>{platform.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </label>
            {form.status === "scheduled" ? (
              <label>
                Publish date
                <input type="datetime-local" name="publishAt" value={form.publishAt} onChange={updateField} required />
              </label>
            ) : (
              <div className="workflow-note">
                <span>{form.status === "published" ? "Published now" : "No publish date"}</span>
                <small>Status can be changed later.</small>
              </div>
            )}
          </div>

          <footer className="modal-actions">
            <button className="button secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button primary" type="submit">{post ? "Save" : "Create"}</button>
          </footer>
        </form>
      )}
    </ModalShell>
  );
}

export default PostModal;
