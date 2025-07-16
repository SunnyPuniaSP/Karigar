/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
function ProtectedAuth({ children }) {
  const navigate = useNavigate();
  const customerauthstatus = useSelector(
    (state) => state.customerAuth.customerStatus
  );
  const workerauthstatus = useSelector(
    (state) => state.workerAuth.workerStatus
  );
  useEffect(() => {
    if (customerauthstatus) {
      navigate("/customer/auth/home");
    } else if (workerauthstatus) {
      navigate("/worker/auth/home");
    }
  }, []);
  return <>{children}</>;
}

export default ProtectedAuth;
