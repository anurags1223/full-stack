const syncedPosts = [
  {
    id: "sync-update",
    title: "New feature reminder",
    content:
      "Remind customers about the recently added scheduling option and where to find it.",
    platformId: "linkedin",
    status: "published",
    author: "Aisha Rao",
    publishAt: "2026-07-30T08:30:00.000Z",
    reactions: 342,
    comments: 27,
  },
  {
    id: "sync-morning",
    title: "Morning story post",
    content:
      "Share a lightweight behind-the-scenes update before the campaign goes live.",
    platformId: "instagram",
    status: "scheduled",
    author: "Dev Mehta",
    publishAt: "2026-08-04T08:00:00.000Z",
    reactions: 0,
    comments: 0,
  },
  {
    id: "sync-question",
    title: "Audience question",
    content:
      "Ask the audience which product tip they want explained next.",
    platformId: "x",
    status: "draft",
    author: "Kabir Shah",
    publishAt: null,
    reactions: 0,
    comments: 0,
  },
];

const delay = (milliseconds) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

export async function getPosts() {
  await delay(700);
  const updatedAt = new Date().toISOString();

  return syncedPosts.map((post) => ({ ...post, updatedAt }));
}
