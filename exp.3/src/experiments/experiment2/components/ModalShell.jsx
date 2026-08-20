import { useEffect } from "react";
import Icon from "./Icon.jsx";

function ModalShell({ children, labelId, onClose, size = "regular" }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby={labelId}
        aria-modal="true"
        className={`modal ${size}`}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog">
          <Icon name="x" size={18} />
        </button>
        {children}
      </section>
    </div>
  );
}

export default ModalShell;
