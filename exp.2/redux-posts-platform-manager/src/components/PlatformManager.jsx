import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  platformAdded,
  platformRemoved,
  platformUpdated,
} from "../features/platforms/platformsSlice.js";
import PlatformMark from "./PlatformMark.jsx";
import ModalShell from "./ModalShell.jsx";

const emptyForm = { name: "", handle: "", color: "#2563eb" };

function PlatformManager({ onClose, platforms, posts }) {
  const dispatch = useDispatch();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const edit = (platform) => {
    setEditingId(platform.id);
    setForm({ name: platform.name, handle: platform.handle, color: platform.color });
    setError("");
  };

  const submit = (event) => {
    event.preventDefault();
    const duplicate = platforms.some(
      (platform) =>
        platform.id !== editingId &&
        platform.name.toLowerCase() === form.name.trim().toLowerCase(),
    );

    if (duplicate) {
      setError("A platform with this name already exists.");
      return;
    }

    if (editingId) {
      dispatch(platformUpdated({ id: editingId, changes: form }));
    } else {
      dispatch(platformAdded(form));
    }
    reset();
  };

  return (
    <ModalShell labelId="platform-modal-title" onClose={onClose} size="wide">
      <header className="modal-header">
        <p className="label">Platforms</p>
        <h2 id="platform-modal-title">Manage platforms</h2>
        <p>Add, edit, or remove publishing platforms.</p>
      </header>

      <div className="platform-manager-grid">
        <div className="platform-manager-list">
          {platforms.map((platform) => {
            const linkedPosts = posts.filter((post) => post.platformId === platform.id).length;
            return (
              <div className="manage-platform-row" key={platform.id}>
                <PlatformMark platform={platform} />
                <span className="manage-platform-copy">
                  <strong>{platform.name}</strong>
                  <small>{platform.handle} - {linkedPosts} linked {linkedPosts === 1 ? "post" : "posts"}</small>
                </span>
                <button className="button small" type="button" onClick={() => edit(platform)}>Edit</button>
                <button
                  className="button small danger-soft"
                  type="button"
                  disabled={linkedPosts > 0}
                  onClick={() => dispatch(platformRemoved(platform.id))}
                  title={linkedPosts > 0 ? "Delete linked posts first" : "Delete platform"}
                >
                  Delete
                </button>
              </div>
            );
          })}
          {platforms.length === 0 && <div className="platform-list-empty">No platforms yet.</div>}
        </div>

        <form className="platform-form" onSubmit={submit}>
          <h3>{editingId ? "Edit platform" : "Add platform"}</h3>
          <label>
            Name
            <input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength="30" />
          </label>
          <label>
            Handle
            <input value={form.handle} onChange={(event) => setForm({ ...form, handle: event.target.value })} required maxLength="40" />
          </label>
          <label>
            Color
            <span className="color-field">
              <input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} aria-label="Platform color" />
              <code>{form.color.toUpperCase()}</code>
            </span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button primary full" type="submit">{editingId ? "Save" : "Add"}</button>
          {editingId && <button className="text-button centered" type="button" onClick={reset}>Cancel editing</button>}
        </form>
      </div>
    </ModalShell>
  );
}

export default PlatformManager;
