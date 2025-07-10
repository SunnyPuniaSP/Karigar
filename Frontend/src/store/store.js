import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import customerauthreducer from "./customerAuthSlice.js";
import workerauthreducer from "./workerAuthSlice.js";

const customerPersistConfig = {
  key: "customerAuth",
  storage,
};

const workerPersistConfig = {
  key: "workerAuth",
  storage,
};

const customerAuthReducer = persistReducer(customerPersistConfig, customerauthreducer);
const workerAuthReducer = persistReducer(workerPersistConfig, workerauthreducer);

export const store = configureStore({
  reducer: {
    customerAuth: customerAuthReducer,
    workerAuth: workerAuthReducer,
  },
});

export const persistor = persistStore(store);
