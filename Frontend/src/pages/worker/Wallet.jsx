import React, { useEffect, useState } from "react";
import api from "../../api.js";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { setWorkerDetails } from "@/store/workerAuthSlice";
import { toast } from "sonner";
import Loader from "../style/Loader.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/pages/ui/dialog";

const Wallet = () => {
  const dispatch = useDispatch();
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState([]);
  const [open, setOpen] = useState(false);
  const [addAmount, setAddAmount] = useState();
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    setLoader(true);
    api
      .get("/api/v1/worker/online-transactions")
      .then((res) => {
        setTransactions(res.data.data);
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred";
        toast(errorMessage, {
          duration: 3000,
          className: "bg-white border border-red-200 shadow",
        });
      })
      .finally(() => {
        setLoader(false);
      });

    setLoader(true);
    api
      .get("/api/v1/worker/current-user")
      .then((res) => {
        setWalletBalance(res.data.data.walletBalance);
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred";
        toast(errorMessage, {
          duration: 3000,
          className: "bg-white border border-red-200 shadow",
        });
      })
      .finally(() => {
        setLoader(false);
      });
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const addAmountToWallet = async () => {
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const { data } = await api.post(
        `/api/v1/payment/create-order-for-worker`,
        { amount: addAmount }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: data.data.id,
        ...data.data,
        handler: async function (response) {
          const options = {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            amount: addAmount,
          };
          setLoader(true);
          api
            .post(`/api/v1/payment/verify-payment-for-worker`, options)
            .then(() => {
              api
                .get("/api/v1/worker/current-user")
                .then((res) => {
                  setWalletBalance(res.data.data.walletBalance);
                  dispatch(setWorkerDetails(res.data.data));
                })
                .catch((err) => {
                  const errorMessage =
                    err.response?.data?.message ||
                    "An unexpected error occurred";
                  toast(errorMessage, {
                    duration: 3000,
                    className: "bg-white border border-red-200 shadow",
                  });
                });
              api
                .get("/api/v1/worker/online-transactions")
                .then((res) => {
                  setTransactions(res.data.data);
                })
                .catch((err) => {
                  const errorMessage =
                    err.response?.data?.message ||
                    "An unexpected error occurred";
                  toast(errorMessage, {
                    duration: 3000,
                    className: "bg-white border border-red-200 shadow",
                  });
                });
            })
            .catch((err) => {
              const errorMessage =
                err.response?.data?.message || "An unexpected error occurred";
              toast(errorMessage, {
                duration: 3000,
                className: "bg-white border border-red-200 shadow",
              });
            })
            .finally(() => {
              setLoader(false);
            });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred";
      toast(errorMessage, {
        duration: 3000,
        className: "bg-white border border-red-200 shadow",
      });
    }
  };

  const withdraw = () => {
    toast("🚧 Heads up! Withdraw feature is on the way. Stay tuned!", {
      duration: 3000,
      className: "bg-white shadow-lg border border-gray-200",
    });
  };
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4 shadow-sm">
        <p className="text-sm text-gray-600">Your Wallet Balance</p>
        <p className="text-3xl font-extrabold text-blue-800">
          ₹{walletBalance}
        </p>
      </div>
      <div className="flex justify-center gap-3 mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Add Money</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ color: "#0B1D3A" }}>
                Add Money to Wallet
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-between gap-3">
              <input
                onChange={(e) => setAddAmount(e.target.value)}
                type="number"
                name="addAmount"
                placeholder="Enter amount you wish to add"
                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <Button
                onClick={addAmountToWallet}
                className="font-medium py-2 px-6 rounded-lg shadow transition"
              >
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="secondary" onClick={withdraw}>
          Withdraw
        </Button>
      </div>
      <h2 style={{ color: "#0B1D3A" }} className="text-2xl font-bold mb-4">
        Transaction History
      </h2>
      {transactions.length === 0 ? (
        <div className="text-gray-500 text-center py-12 border rounded-xl shadow-sm bg-white">
          No Previous Transactions Exist
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn, index) => {
            const isCredit = txn.transactionNature === "credit";

            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border p-4 transition hover:shadow-md"
              >
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(txn.dateAndTime).toLocaleString()}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      isCredit ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {isCredit ? (
                      <ArrowUpCircle className="w-4 h-4" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4" />
                    )}
                    {isCredit ? "Credit" : "Debit"}
                  </div>
                </div>

                <div
                  style={{ color: "#0B1D3A" }}
                  className="text-xl font-bold mt-2"
                >
                  ₹{txn.amount}
                </div>

                {!txn.walletRecharge ? (
                  <div className="text-sm text-gray-500 mt-1">
                    {!txn.platformFee ? (
                      <span>Payment Received for</span>
                    ) : (
                      <span>Platform Fee deducted for</span>
                    )}{" "}
                    Service Request:&nbsp;
                    <Link
                      to={`/worker/auth/job/${txn.serviceRequestId}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {txn.serviceRequestId}
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-1">
                    {txn.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {loader && <Loader />}
    </div>
  );
};

export default Wallet;
