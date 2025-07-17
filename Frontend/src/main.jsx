import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "leaflet/dist/leaflet.css";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LandingPageCustomer from "./pages/customer/LandingPageCustomer";
import LandingPageWorker from "./pages/worker/LandingPageWorker";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerSignUp from "./pages/customer/CustomerSignUp";
import WorkerSignUp from "./pages/worker/WorkerSignUp";
import WorkerLogin from "./pages/worker/WorkerLogin";
import Home from "./pages/customer/Home";
import CustomerLayout from "./pages/customer/CustomerLayout";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.js";
import { Provider } from "react-redux";
import CustomerProfile from "./pages/customer/CustomerProfile";
import SelectCategory from "./pages/customer/SelectCategory";
import ServiceRequestForm from "./pages/customer/ServiceRequestForm";
import ServiceRequest from "./pages/customer/ServiceRequest";
import WorkerLayout from "./pages/worker/WorkerLayout";
import WorkerHome from "./pages/worker/Home";
import WorkerProfile from "./pages/worker/WorkerProfile";
import FindJobs from "./pages/worker/FindJobs";
import JobConnectionPage from "./pages/worker/JobConnectionPage";
import MyRequests from "./pages/customer/MyRequests";
import MyJobs from "./pages/worker/MyJobs";
import Wallet from "./pages/worker/Wallet";
import ProtectedAuthCustomer from "./pages/customer/ProtectedAuthCustomer";
import ProtectedAuthWorker from "./pages/worker/ProtectedAuthWorker";
import ProtectedAuth from "./pages/ProtectedAuth";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route
        path=""
        element={
          <ProtectedAuth>
            <LandingPage />
          </ProtectedAuth>
        }
      />
      <Route path="customer/">
        <Route path="" element={<LandingPageCustomer />} />
        <Route path="login" element={<CustomerLogin />} />
        <Route path="signup" element={<CustomerSignUp />} />
        <Route
          path="auth/"
          element={
            <ProtectedAuthCustomer>
              <CustomerLayout />
            </ProtectedAuthCustomer>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="select-category" element={<SelectCategory />} />
          <Route
            path="select-category/:category/more-info"
            element={<ServiceRequestForm />}
          />
          <Route path="service-request/">
            <Route path=":serviceRequestId" element={<ServiceRequest />} />
          </Route>
          <Route path="past-requests" element={<MyRequests />} />
        </Route>
      </Route>
      <Route path="worker/">
        <Route path="" element={<LandingPageWorker />} />
        <Route path="login" element={<WorkerLogin />} />
        <Route path="signup" element={<WorkerSignUp />} />
        <Route
          path="auth/"
          element={
            <ProtectedAuthWorker>
              <WorkerLayout />
            </ProtectedAuthWorker>
          }
        >
          <Route path="home" element={<WorkerHome />} />
          <Route path="profile" element={<WorkerProfile />} />
          <Route path="find-jobs" element={<FindJobs />} />
          <Route path="job/:serviceRequestId" element={<JobConnectionPage />} />
          <Route path="past-jobs" element={<MyJobs />} />
          <Route path="wallet" element={<Wallet />} />
        </Route>
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors />
      </PersistGate>
    </Provider>
  </StrictMode>
);
