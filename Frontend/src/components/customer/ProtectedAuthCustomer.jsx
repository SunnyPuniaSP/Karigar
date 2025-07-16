import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
function ProtectedAuthCustomer({ children }) {
  const navigate = useNavigate();
  const customerauthstatus = useSelector(
    (state) => state.customerAuth.customerStatus
  );
  const workerauthstatus = useSelector(
    (state) => state.workerAuth.workerStatus
  );
  useEffect(() => {
    if (!customerauthstatus) {
      if (workerauthstatus) navigate("/worker/auth/home");
      else navigate("/customer/");
    }
  }, []);
  return <>{children}</>;
}

export default ProtectedAuthCustomer;
