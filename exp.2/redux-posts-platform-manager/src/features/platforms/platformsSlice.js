import { createEntityAdapter, createSlice, nanoid } from "@reduxjs/toolkit";

const platformsAdapter = createEntityAdapter({
  sortComparer: (first, second) => first.name.localeCompare(second.name),
});

const starterPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@brand_updates",
    shortCode: "IG",
    color: "#ef8f72",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "Brand Team",
    shortCode: "IN",
    color: "#78a6ef",
  },
  {
    id: "x",
    name: "X / Twitter",
    handle: "@brandteam",
    shortCode: "X",
    color: "#252c28",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@brandchannel",
    shortCode: "YT",
    color: "#eb625c",
  },
];

const initialState = platformsAdapter.setAll(
  platformsAdapter.getInitialState({ selectedId: "all" }),
  starterPlatforms,
);

const platformsSlice = createSlice({
  name: "platforms",
  initialState,
  reducers: {
    platformAdded: {
      reducer: platformsAdapter.addOne,
      prepare({ name, handle, color }) {
        return {
          payload: {
            id: nanoid(8),
            name: name.trim(),
            handle: handle.trim(),
            color,
            shortCode: name.trim().slice(0, 2).toUpperCase(),
          },
        };
      },
    },
    platformUpdated(state, action) {
      const { id, changes } = action.payload;
      const name = changes.name.trim();
      platformsAdapter.updateOne(state, {
        id,
        changes: {
          ...changes,
          name,
          handle: changes.handle.trim(),
          shortCode: name.slice(0, 2).toUpperCase(),
        },
      });
    },
    platformRemoved(state, action) {
      platformsAdapter.removeOne(state, action.payload);
      if (state.selectedId === action.payload) {
        state.selectedId = "all";
      }
    },
    platformSelected(state, action) {
      state.selectedId = action.payload;
    },
  },
});

export const {
  platformAdded,
  platformRemoved,
  platformSelected,
  platformUpdated,
} = platformsSlice.actions;

const selectors = platformsAdapter.getSelectors((state) => state.platforms);

export const {
  selectAll: selectAllPlatforms,
  selectById: selectPlatformById,
  selectEntities: selectPlatformEntities,
  selectIds: selectPlatformIds,
  selectTotal: selectPlatformTotal,
} = selectors;

export const selectSelectedPlatformId = (state) => state.platforms.selectedId;

export default platformsSlice.reducer;
