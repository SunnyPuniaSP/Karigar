/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api.js";
import { Button } from "../ui/button";
import Loader from "../style/Loader.jsx";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import houseIc from "../../assets/3d-house.png";
import workerIc from "../../assets/mechanic.png";
import { useDispatch } from "react-redux";
import {
  clearIsLiveRequest,
  clearLiveServiceId,
} from "../../store/customerAuthSlice";
import axios from "axios";
import { toast } from "sonner";

const getRoute = async (start, end) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  const res = await axios.get(url);
  const coordinates = res.data.routes[0].geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );
  const duration = res.data.routes[0].duration;
  return { coordinates, duration };
};

const customerIcon = new L.Icon({
  iconUrl: houseIc,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -36],
});
const workerIcon = new L.Icon({
  iconUrl: workerIc,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -36],
});

function FitBounds({ workerLocation, customerLocation }) {
  const map = useMap();
  useEffect(() => {
    if (workerLocation && customerLocation) {
      const bounds = [
        [workerLocation.lat, workerLocation.lng],
        [customerLocation.lat, customerLocation.lng],
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [workerLocation, customerLocation, map]);
  return null;
}

const SearchingWorker = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { serviceRequestId } = useParams();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workerAccepted, setWorkerAccepted] = useState(false);
  const [workerDetails, setWorkerDetails] = useState(null);

  const [workerLocation, setWorkerLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [etaMinutes, setEtaMinutes] = useState(null);

  const [showCancellButtonByMistake, setShowCancellButtonByMistake] =
    useState(false);
  const [showCancellButtonLate, setShowCancellButtonLate] = useState(false);
  const [cancellCountdown, setCancellCountdown] = useState(30);
  const [showCancellButtons, setShowCancellButtons] = useState(true);
  const cancellButtonStarted = useRef(false);

  const [showAcceptRejectButtons, setShowAcceptRejectButton] = useState(false);

  const [showPayButton, setShowPayButton] = useState(false);

  const [jobCompleted, setJobCompleted] = useState(false);

  const toggleIsLiveRequestToFalse = useRef(false);

  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const interval = setInterval(fetchStatus, 4000);
    fetchStatus();
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = () => {
    api
      .get(`/api/v1/service-request/${serviceRequestId}/status`)
      .then((res) => {
        const data = res.data.data;
        setRequestData(data);
        if (
          data.orderStatus === "completed" &&
          !toggleIsLiveRequestToFalse.current
        ) {
          setShowPayButton(false);
          setJobCompleted(true);
          api
            .patch(
              `/api/v1/customer/${data.customerId}/toggle-isliveRequestTo-false`
            )
            .then(() => {
              dispatch(clearIsLiveRequest());
              dispatch(clearLiveServiceId());
            })
            .catch((err) => {
              const errorMessage =
                err.response?.data?.message || "An unexpected error occurred";
              toast(errorMessage, {
                duration: 3000,
                className: "bg-white border border-red-200 shadow",
              });
            });
          toggleIsLiveRequestToFalse.current = true;
          localStorage.removeItem("connectedStartTime");
        }
        if (
          data.orderStatus === "cancelled" &&
          !toggleIsLiveRequestToFalse.current
        ) {
          setShowCancellButtons(false);
          setJobCompleted(true);
          api
            .patch(
              `/api/v1/customer/${data.customerId}/toggle-isliveRequestTo-false`
            )
            .then(() => {
              dispatch(clearIsLiveRequest());
              dispatch(clearLiveServiceId());
            })
            .catch((err) => {
              const errorMessage =
                err.response?.data?.message || "An unexpected error occurred";
              toast(errorMessage, {
                duration: 3000,
                className: "bg-white border border-red-200 shadow",
              });
            });
          toggleIsLiveRequestToFalse.current = true;
          localStorage.removeItem("connectedStartTime");
        }
        if (data.orderStatus === "repairAmountQuoted") {
          setShowAcceptRejectButton(true);
        }
        if (
          data.orderStatus === "payment_pending_visiting_fee" ||
          data.orderStatus === "payment_pending_quote_amount"
        ) {
          setShowPayButton(true);
        }
        if (
          data.orderStatus !== "searching" &&
          data.orderStatus !== "connected" &&
          data.orderStatus !== "onway"
        ) {
          setShowCancellButtons(false);
          setLoading(false);
          setWorkerAccepted(true);
        }
        if (
          (data.orderStatus === "connected" || data.orderStatus === "onway") &&
          !cancellButtonStarted.current
        ) {
          setWorkerAccepted(true);
          setLoading(false);

          const existingTimestamp = localStorage.getItem("connectedStartTime");

          if (!existingTimestamp) {
            localStorage.setItem("connectedStartTime", Date.now().toString());
          }

          const timestamp = parseInt(
            localStorage.getItem("connectedStartTime"),
            10
          );
          const now = Date.now();
          const secondsPassed = Math.floor((now - timestamp) / 1000);
          if (secondsPassed < 30) {
            setShowCancellButtonByMistake(true);
            setCancellCountdown(30 - secondsPassed);

            const countdownInterval = setInterval(() => {
              setCancellCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  setShowCancellButtonByMistake(false);
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }

          if (secondsPassed >= 30 * 60) {
            setShowCancellButtonLate(true);
          } else {
            setTimeout(() => {
              setShowCancellButtonLate(true);
            }, (30 * 60 - secondsPassed) * 1000);
          }

          cancellButtonStarted.current = true;
        }
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred";
        toast(errorMessage, {
          duration: 3000,
          className: "bg-white border border-red-200 shadow",
        });
      });
  };

  useEffect(() => {
    if (workerAccepted && requestData?.workerId) {
      api
        .get(`/api/v1/worker/${requestData.workerId}/get-details`)
        .then((res) => setWorkerDetails(res.data.data))
        .catch((err) => {
          const errorMessage =
            err.response?.data?.message || "An unexpected error occurred";
          toast(errorMessage, {
            duration: 3000,
            className: "bg-white border border-red-200 shadow",
          });
        });
    }
  }, [workerAccepted]);

  useEffect(() => {
    let interval;
    const fetchLocations = async () => {
      if (workerAccepted && requestData.workerId) {
        try {
          const workerRes = await api.get(
            `/api/v1/worker/${requestData.workerId}/location`
          );
          const wLoc = {
            lat: workerRes.data.data.lat,
            lng: workerRes.data.data.lng,
          };
          setWorkerLocation(wLoc);
          const cCoords = requestData.customerLocation?.coordinates || [];
          if (cCoords.length === 2) {
            const cLoc = { lat: cCoords[1], lng: cCoords[0] };
            setCustomerLocation(cLoc);
            const route = await getRoute(wLoc, cLoc);
            setRoutePath(route.coordinates);
            setEtaMinutes(Math.ceil(route.duration / 60));
          }
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || "An unexpected error occurred";
          toast(errorMessage, {
            duration: 3000,
            className: "bg-white border border-red-200 shadow",
          });
        }
      }
    };

    if (workerAccepted && requestData.workerId) {
      fetchLocations();
      interval = setInterval(fetchLocations, 5000);
    }
    return () => clearInterval(interval);
  }, [workerAccepted]);

  const cancelSearch = () => {
    setLoader(true);
    api
      .post(`/api/v1/service-request/${serviceRequestId}/delete-request`)
      .then(() => {
        dispatch(clearIsLiveRequest());
        dispatch(clearLiveServiceId());
        navigate("/customer/auth/home");
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
  };

  const cancelReqAsByMistake = () => {
    setLoader(true);
    api
      .patch(
        `/api/v1/service-request/${serviceRequestId}/cancelled-by-customer-as-by-mistake`
      )
      .then(() => {
        dispatch(clearIsLiveRequest());
        dispatch(clearLiveServiceId());
        setShowCancellButtons(false);
        setRequestData((prevState) => ({
          ...prevState,
          orderStatus: "cancelled",
        }));
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
  };

  const cancelReqAsWorkerLateOrNotResponding = () => {
    setLoader(true);
    api
      .patch(
        `/api/v1/service-request/${serviceRequestId}/cancelled-by-customer-as-worker-not-responding-or-late`
      )
      .then(() => {
        dispatch(clearIsLiveRequest());
        dispatch(clearLiveServiceId());
        setShowCancellButtons(false);
        setRequestData((prevState) => ({
          ...prevState,
          orderStatus: "cancelled",
        }));
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
  };

  const quoteAccepted = () => {
    setLoader(true);
    api
      .patch(`/api/v1/service-request/${serviceRequestId}/accept-repair-quote`)
      .then(() => {
        setShowAcceptRejectButton(false);
        setShowPayButton(true);
        setRequestData((prevState) => ({
          ...prevState,
          orderStatus: "payment_pending_quote_amount",
        }));
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
  };

  const quoteRejected = () => {
    setLoader(true);
    api
      .patch(`/api/v1/service-request/${serviceRequestId}/reject-repair-quote`)
      .then(() => {
        setShowAcceptRejectButton(false);
        setShowPayButton(true);
        setRequestData((prevState) => ({
          ...prevState,
          orderStatus: "payment_pending_visiting_fee",
        }));
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
  };

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

  const handlePayment = async () => {
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }
    try {
      const { data } = await api.post(
        `/api/v1/payment/${serviceRequestId}/create-order`
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
          };
          api
            .post(`/api/v1/payment/${serviceRequestId}/verify-payment`, options)
            .then(() => {
              requestData.orderStatus = "completed";
            })
            .catch((err) => {
              const errorMessage =
                err.response?.data?.message || "An unexpected error occurred";
              toast(errorMessage, {
                duration: 3000,
                className: "bg-white border border-red-200 shadow",
              });
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

  const STATUS_MAP = {
    connected: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "🤝",
      label: "Connected, Worker coming soon",
    },
    onway: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "🚗",
      label: "Worker on the way",
    },
    arrived: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "🏠",
      label: "Worker has arrived",
    },
    inspecting: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      icon: "🧐",
      label: "Worker is inspecting the issue",
    },
    repairAmountQuoted: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "💬",
      label: "Repair Quote provided",
    },
    payment_pending_quote_amount: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "💳",
      label: "Payment pending",
    },
    payment_pending_visiting_fee: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "💰",
      label: "Visiting fee payment pending",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "🎉",
      label: "Job completed",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "❌",
      label: "Request cancelled",
    },
  };

  const StatusBanner = ({ orderStatus }) => {
    const { bg, text, icon, label } = STATUS_MAP[orderStatus];
    return (
      <div
        className={`w-full max-w-2xl mx-auto flex items-center gap-4 px-6 py-4 rounded-xl shadow ${bg} ${text}`}
      >
        <span className="text-3xl">{icon}</span>
        <div className="font-bold text-lg">{label}</div>
      </div>
    );
  };

  if (loading && !workerAccepted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-700">
          Searching for available workers...
        </h2>
        <p className="text-gray-500 mt-2">
          Please wait while we find a nearby technician for your issue.
        </p>
        <Button
          onClick={cancelSearch}
          className="mt-5 cursor-pointer"
          variant="destructive"
        >
          Cancel Search
        </Button>
      </div>
    );
  }

  if (workerAccepted && requestData && workerDetails) {
    const job = requestData;

    return (
      <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10 px-2 gap-5">
        <StatusBanner orderStatus={job.orderStatus} />
        {showCancellButtons && showCancellButtonByMistake && (
          <Button
            variant="destructive"
            onClick={cancelReqAsByMistake}
            className="min-w-[250px]"
          >
            ❌ Cancel Request ({cancellCountdown}s left)
          </Button>
        )}
        {showCancellButtons && showCancellButtonLate && (
          <Button
            variant="destructive"
            onClick={cancelReqAsWorkerLateOrNotResponding}
            className="min-w-[250px]"
          >
            ❌ Cancel Request
          </Button>
        )}
        {showAcceptRejectButtons && (
          <div className="flex flex-col gap-5">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 text-blue-900 rounded-xl px-6 py-4 shadow-md min-w-[320px] text-center">
                <span className="text-lg font-medium">Repair Quote Amount</span>
                <div className="text-2xl font-bold mt-1">
                  ₹{job.quoteAmount}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button onClick={quoteAccepted} className="min-w-[250px]">
                Accept Repair Quote
              </Button>
              <Button
                onClick={quoteRejected}
                variant="destructive"
                className="min-w-[250px]"
              >
                Reject Repair Quote
              </Button>
            </div>
          </div>
        )}
        {showPayButton && (
          <Button onClick={handlePayment} className="min-w-[250px]">
            Pay Now
          </Button>
        )}

        <div className="w-full max-w-2xl rounded-2xl shadow-lg bg-white overflow-hidden">
          <div className="h-80">
            {!jobCompleted &&
            workerLocation &&
            customerLocation &&
            routePath.length > 0 ? (
              <MapContainer
                center={[
                  (workerLocation.lat + customerLocation.lat) / 2,
                  (workerLocation.lng + customerLocation.lng) / 2,
                ]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ width: "100%", height: "100%" }}
              >
                <FitBounds
                  workerLocation={workerLocation}
                  customerLocation={customerLocation}
                />
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[workerLocation.lat, workerLocation.lng]}
                  icon={workerIcon}
                >
                  <Popup>Worker Current Location</Popup>
                </Marker>
                <Marker
                  position={[customerLocation.lat, customerLocation.lng]}
                  icon={customerIcon}
                >
                  <Popup>Your Location</Popup>
                </Marker>
                <Polyline positions={routePath} color="blue" />
              </MapContainer>
            ) : !jobCompleted ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                <svg
                  className="animate-spin h-6 w-6 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <p className="text-lg font-medium">Loading map…</p>
                <p className="text-sm text-gray-400">
                  Please wait while we prepare the map.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-lg font-medium">Job ended</p>
                <p className="text-sm text-gray-400">
                  The map is no longer displayed.{" "}
                </p>
              </div>
            )}
          </div>
        </div>
        {etaMinutes && (
          <div className="text-sm text-gray-700">
            Estimated arrival in:{" "}
            <span className="font-semibold">{etaMinutes + 10} mins</span>
          </div>
        )}
        <div>
          🔵 Searching ➡️ 🤝 Connected ➡️ 🚗 On the way ➡️ 🏠 Arrived ➡️ 🧐
          Inspecting ➡️ 💬 Repair Quote provided ➡️ 🛠️ Repair ➡️ 💳 Payment ➡️
          ✅ Completed
        </div>
        <div className="w-full max-w-2xl  rounded-xl shadow bg-white p-4 flex gap-4 items-center">
          <img
            src={
              workerDetails.profilePhoto ||
              "https://th.bing.com/th/id/OIP.6UhgwprABi3-dz8Qs85FvwHaHa?w=205&h=205&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
            }
            alt="Worker"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex flex-col gap-2">
            <div style={{ color: "#0B1D3A" }} className="text-lg font-bold">
              Worker Details
            </div>
            <div className="flex items-center gap-5">
              <div className=" ">{workerDetails.fullName}</div>
              <div className="text-sm text-gray-500">
                Phone: {workerDetails.phone}
              </div>
              {workerDetails.rating ? (
                <div className="font-semibold text-lg">
                  Rating: {workerDetails.rating}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1">
              {workerDetails.workingCategory.map((cat) => (
                <div
                  id={cat}
                  style={{ backgroundColor: "#0B1D3A" }}
                  className="text-white rounded-xl p-2 min-w-13 text-center"
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full max-w-2xl rounded-xl shadow bg-white p-4">
          <div style={{ color: "#0B1D3A" }} className="text-lg font-bold">
            Job Details
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-700">
              Category: {job.category}
            </div>
            {job.description ? (
              <div className="text-sm text-gray-700">
                Issue Description: {job.description}
              </div>
            ) : null}
            <div className="text-sm text-gray-700">
              Requested At: {new Date(job.createdAt).toLocaleString()}
            </div>
            {job.audioNoteUrl ? (
              <audio src={job.audioNoteUrl} controls></audio>
            ) : null}
          </div>
        </div>
        {loader && <Loader />}
      </div>
    );
  }
};

export default SearchingWorker;
