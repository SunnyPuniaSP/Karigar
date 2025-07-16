/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
function ProtectedAuthWorker({ children }) {
  const navigate = useNavigate();
  const customerauthstatus = useSelector(
    (state) => state.customerAuth.customerStatus
  );
  const workerauthstatus = useSelector(
    (state) => state.workerAuth.workerStatus
  );
  useEffect(() => {
    if (!workerauthstatus) {
      if (customerauthstatus) navigate("/customer/auth/home");
      else navigate("/worker/");
    }
  }, []);
  return <>{children}</>;
}

export default ProtectedAuthWorker;
