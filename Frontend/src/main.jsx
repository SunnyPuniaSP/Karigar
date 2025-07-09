import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage.jsx";
import LandingPageCustomer from "./components/customer/LandingPageCustomer";
import LandingPageWorker from "./components/worker/LandingPageWorker";
import CustomerLogin from "./components/customer/CustomerLogin";
import CustomerSignUp from "./components/customer/CustomerSignUp";
import WorkerSignUp from "./components/worker/WorkerSignUp";
import WorkerLogin from "./components/worker/WorkerLogin";
import Home from "./components/customer/Home";
import CustomerLayout from "./components/customer/CustomerLayout";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.js";
import { Provider } from "react-redux";
import CustomerProfile from "./components/customer/CustomerProfile";
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="" element={<LandingPage />} />
      <Route path="customer/">
        <Route path="" element={<LandingPageCustomer />} />
        <Route path="login" element={<CustomerLogin />} />
        <Route path="sign-up" element={<CustomerSignUp />} />
        <Route path="auth/" element={<CustomerLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>
      </Route>
      <Route path="worker/">
        <Route path="" element={<LandingPageWorker />} />
        <Route path="login" element={<WorkerLogin />} />
        <Route path="sign-up" element={<WorkerSignUp />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>
);
