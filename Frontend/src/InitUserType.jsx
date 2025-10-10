import { useEffect } from "react";
import { useSelector } from "react-redux";
import { setCurrentUserType } from "./api";

const InitUserType = () => {
  const customerauthstatus = useSelector(
    (state) => state.customerAuth.customerStatus
  );
  const workerauthstatus = useSelector(
    (state) => state.workerAuth.workerStatus
  );

  useEffect(() => {
    if (customerauthstatus) setCurrentUserType("customer");
    else if (workerauthstatus) setCurrentUserType("worker");
  }, [customerauthstatus,workerauthstatus]);

  return null;
};

export default InitUserType;
