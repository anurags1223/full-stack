import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  nanoid,
} from "@reduxjs/toolkit";
import { getPosts } from "../../services/mockPostsApi.js";

const postsAdapter = createEntityAdapter({
  sortComparer: (first, second) =>
    second.updatedAt.localeCompare(first.updatedAt),
});

const initialPosts = [
  {
    id: "post-launch",
    title: "Launch checklist for the new campaign",
    content:
      "Confirm copy, visuals, target time, and platform ownership before publishing.",
    platformId: "linkedin",
    status: "published",
    author: "Aisha Rao",
    updatedAt: "2026-07-29T11:40:00.000Z",
    publishAt: "2026-07-29T11:40:00.000Z",
    reactions: 284,
    comments: 31,
  },
  {
    id: "post-studio",
    title: "Weekly product photo set",
    content:
      "Share three product shots with a short caption and a clear link to the latest collection.",
    platformId: "instagram",
    status: "scheduled",
    author: "Dev Mehta",
    updatedAt: "2026-07-29T10:15:00.000Z",
    publishAt: "2026-08-01T09:30:00.000Z",
    reactions: 0,
    comments: 0,
  },
  {
    id: "post-poll",
    title: "Poll: which topic should we cover next?",
    content:
      "Ask followers to choose between tutorials, customer stories, or release updates.",
    platformId: "x",
    status: "draft",
    author: "Aisha Rao",
    updatedAt: "2026-07-29T08:20:00.000Z",
    publishAt: null,
    reactions: 0,
    comments: 0,
  },
  {
    id: "post-demo",
    title: "Short video walkthrough",
    content:
      "Publish a quick tour showing how the team uses the new posting workflow.",
    platformId: "youtube",
    status: "scheduled",
    author: "Kabir Shah",
    updatedAt: "2026-07-28T16:45:00.000Z",
    publishAt: "2026-08-02T14:00:00.000Z",
    reactions: 0,
    comments: 0,
  },
  {
    id: "post-notes",
    title: "Customer story highlights",
    content:
      "Summarize the strongest quote, result, and call to action from this month's case study.",
    platformId: "linkedin",
    status: "published",
    author: "Kabir Shah",
    updatedAt: "2026-07-27T13:10:00.000Z",
    publishAt: "2026-07-27T13:10:00.000Z",
    reactions: 196,
    comments: 18,
  },
];

export const fetchPosts = createAsyncThunk("posts/fetchPosts", getPosts);

const initialState = postsAdapter.setAll(
  postsAdapter.getInitialState({
    loading: "idle",
    error: null,
    statusFilter: "all",
    search: "",
    lastSynced: null,
  }),
  initialPosts,
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    postAdded: {
      reducer: postsAdapter.addOne,
      prepare(post) {
        const now = new Date().toISOString();
        return {
          payload: {
            id: nanoid(10),
            title: post.title.trim(),
            content: post.content.trim(),
            author: post.author.trim(),
            platformId: post.platformId,
            status: post.status,
            updatedAt: now,
            publishAt:
              post.status === "published" ? now : post.publishAt || null,
            reactions: 0,
            comments: 0,
          },
        };
      },
    },
    postUpdated(state, action) {
      postsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          ...action.payload.changes,
          title: action.payload.changes.title.trim(),
          content: action.payload.changes.content.trim(),
          author: action.payload.changes.author.trim(),
          updatedAt: new Date().toISOString(),
        },
      });
    },
    postDeleted: postsAdapter.removeOne,
    postStatusChanged(state, action) {
      const post = state.entities[action.payload];
      if (!post) return;

      const nextStatus = {
        draft: "scheduled",
        scheduled: "published",
        published: "draft",
      }[post.status];
      const now = new Date().toISOString();

      postsAdapter.updateOne(state, {
        id: post.id,
        changes: {
          status: nextStatus,
          updatedAt: now,
          publishAt:
            nextStatus === "published"
              ? now
              : nextStatus === "scheduled"
                ? post.publishAt || now
                : null,
        },
      });
    },
    statusFilterChanged(state, action) {
      state.statusFilter = action.payload;
    },
    searchChanged(state, action) {
      state.search = action.payload;
    },
    filtersCleared(state) {
      state.statusFilter = "all";
      state.search = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.lastSynced = new Date().toISOString();
        postsAdapter.upsertMany(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Unable to sync posts.";
      });
  },
});

export const {
  filtersCleared,
  postAdded,
  postDeleted,
  postStatusChanged,
  postUpdated,
  searchChanged,
  statusFilterChanged,
} = postsSlice.actions;

const selectors = postsAdapter.getSelectors((state) => state.posts);

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectEntities: selectPostEntities,
  selectIds: selectPostIds,
  selectTotal: selectPostTotal,
} = selectors;

export const selectVisiblePosts = createSelector(
  [
    selectAllPosts,
    (state) => state.posts.statusFilter,
    (state) => state.posts.search,
    (state) => state.platforms.selectedId,
  ],
  (posts, statusFilter, search, selectedPlatformId) => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;
      const matchesPlatform =
        selectedPlatformId === "all" ||
        post.platformId === selectedPlatformId;
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query);

      return matchesStatus && matchesPlatform && matchesSearch;
    });
  },
);

export default postsSlice.reducer;
