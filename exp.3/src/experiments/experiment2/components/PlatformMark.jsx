function PlatformMark({ platform, size = "medium" }) {
  return (
    <span
      aria-hidden="true"
      className={`platform-mark ${size}`}
      style={{ "--platform-color": platform?.color || "#aab3ad" }}
    >
      {platform?.shortCode || "?"}
    </span>
  );
}

export default PlatformMark;
