import { configureStore } from "@reduxjs/toolkit";
import customerAuthReducer from "./customerAuthSlice.js";

export const store = configureStore({
  reducer: customerAuthReducer,
});
