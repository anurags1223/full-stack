import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
  nanoid,
} from "@reduxjs/toolkit";
import activityReducer, {
  activityLogged,
} from "../features/activity/activitySlice.js";
import platformsReducer, {
  platformAdded,
  platformRemoved,
  platformSelected,
  platformUpdated,
} from "../features/platforms/platformsSlice.js";
import postsReducer, {
  fetchPosts,
  postAdded,
  postDeleted,
  postStatusChanged,
  postUpdated,
} from "../features/posts/postsSlice.js";

const activityListener = createListenerMiddleware();

const activityMessages = {
  [postAdded.type]: "A post was added to the entity store",
  [postUpdated.type]: "Post changes were merged by ID",
  [postDeleted.type]: "A post entity was removed",
  [postStatusChanged.type]: "A post advanced in the workflow",
  [platformAdded.type]: "A platform entity was created",
  [platformUpdated.type]: "A platform entity was updated",
  [platformRemoved.type]: "An unused platform was removed",
  [platformSelected.type]: "The active platform filter changed",
  [fetchPosts.fulfilled.type]: "The mock API sync completed",
};

activityListener.startListening({
  matcher: isAnyOf(
    postAdded,
    postUpdated,
    postDeleted,
    postStatusChanged,
    platformAdded,
    platformUpdated,
    platformRemoved,
    platformSelected,
    fetchPosts.fulfilled,
  ),
  effect: (action, listenerApi) => {
    listenerApi.dispatch(
      activityLogged({
        id: nanoid(8),
        message: activityMessages[action.type],
        actionType: action.type,
        time: Date.now(),
      }),
    );
  },
});

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(activityListener.middleware),
});
