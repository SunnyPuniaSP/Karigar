import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import customerauthreducer from "./customerAuthSlice.js";

const persistConfig = {
  key: "customer",
  storage,
};

const customerAuthReducer = persistReducer(persistConfig, customerauthreducer);

export const store = configureStore({
  reducer: customerAuthReducer,
});

export const persistor = persistStore(store);
