import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Observation, FeedTab } from "../services/types";
import * as api from "../services/api";

interface FeedState {
  observations: Observation[];
  cursor: string | undefined;
  isLoading: boolean;
  currentTab: FeedTab;
  hasMore: boolean;
}

const initialState: FeedState = {
  observations: [],
  cursor: undefined,
  isLoading: false,
  currentTab: "home",
  hasMore: true,
};

export const loadFeed = createAsyncThunk(
  "feed/loadFeed",
  async (_, { getState }) => {
    const state = getState() as { feed: FeedState };
    return api.fetchFeed(state.feed.cursor);
  }
);

export const loadInitialFeed = createAsyncThunk(
  "feed/loadInitialFeed",
  async () => {
    return api.fetchFeed();
  }
);

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    switchTab: (state, action: PayloadAction<FeedTab>) => {
      state.currentTab = action.payload;
      state.observations = [];
      state.cursor = undefined;
      state.hasMore = true;
    },
    resetFeed: (state) => {
      state.observations = [];
      state.cursor = undefined;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFeed.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.observations = [
          ...state.observations,
          ...action.payload.occurrences,
        ];
        state.cursor = action.payload.cursor;
        state.hasMore = !!action.payload.cursor;
        state.isLoading = false;
      })
      .addCase(loadFeed.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(loadInitialFeed.pending, (state) => {
        state.isLoading = true;
        state.observations = [];
        state.cursor = undefined;
      })
      .addCase(loadInitialFeed.fulfilled, (state, action) => {
        state.observations = action.payload.occurrences;
        state.cursor = action.payload.cursor;
        state.hasMore = !!action.payload.cursor;
        state.isLoading = false;
      })
      .addCase(loadInitialFeed.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { switchTab, resetFeed } = feedSlice.actions;
export default feedSlice.reducer;
