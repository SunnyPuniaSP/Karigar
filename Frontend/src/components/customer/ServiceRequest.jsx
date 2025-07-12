/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../ui/button";
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

const getRoute = async (start, end) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  const res = await axios.get(url);
  const coordinates = res.data.routes[0].geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );
  const duration = res.data.routes[0].duration; // in seconds
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

// --- Helper to fit map bounds to both markers ---
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
  const { serviceRequestId } = useParams();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workerAccepted, setWorkerAccepted] = useState(false);
  const [workerDetails, setWorkerDetails] = useState(null);

  // Map-related state
  const [workerLocation, setWorkerLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [etaMinutes, setEtaMinutes] = useState(null);

  const [showCancellButtonByMistake, setShowCancellButtonByMistake] = useState(false);
  const [showCancellButtonLate, setShowCancellButtonLate] = useState(false);
  const [cancellCountdown, setCancellCountdown] = useState(30);
  const [showCancellButtons,setShowCancellButtons]=useState(true);
  const cancellButtonStarted = useRef(false);

  const [showAcceptRejectButtons,setShowAcceptRejectButton]=useState(false);

  const [showPayButton,setShowPayButton]=useState(false);

  // Poll for service request status
  useEffect(() => {
    const interval = setInterval(fetchStatus, 4000);
    fetchStatus();
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = () => {
    axios
      .get(`/api/v1/service-request/${serviceRequestId}/status`)
      .then((res) => {
        const data = res.data.data;
        setRequestData(data);
        if(data.orderStatus==="completed"){
          setShowPayButton(false);
        }
        if(data.orderStatus==="repairAmountQuoted"){
          setShowAcceptRejectButton(true);
        }
        if(data.orderStatus!=="searching" && data.orderStatus!=="connected" && data.orderStatus!=="onway"){
          setShowCancellButtons(false);
        }
        console.log("Fetched orderStatus:", data.orderStatus);
        if (
          (data.orderStatus === "connected" || data.orderStatus === "onway") &&
          !cancellButtonStarted.current
        ) {
          setWorkerAccepted(true);
          setLoading(false);

          // Start cancel countdown and visibility
          setShowCancellButtonByMistake(true);
          setCancellCountdown(30); // reset to 30 sec
          setTimeout(() => {
            setShowCancellButtonLate(true);
          }, 60 * 1000);
          const countdownInterval = setInterval(() => {
            setCancellCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                setShowCancellButtonByMistake(false); // hide button after 30s
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          cancellButtonStarted.current = true;
        }
      })
      .catch((error) => {
        console.error("Error fetching request status", error);
        alert("Something went wrong while checking the request status");
      });
  };

  // Fetch worker details when assigned
  useEffect(() => {
    if (workerAccepted && requestData?.workerId) {
      axios
        .get(`/api/v1/worker/${requestData.workerId}/get-details`)
        .then((res) => setWorkerDetails(res.data.data))
        .catch((err) => {
          console.error("Error fetching worker details", err);
          alert(
            "Worker accepted your request, but details couldn't be fetched."
          );
        });
    }
  }, [workerAccepted, requestData]);

  // Poll for worker and customer locations and fetch the real route
  useEffect(() => {
    let interval;
    const fetchLocations = async () => {
      if (workerAccepted && requestData && workerDetails) {
        try {
          // Fetch worker's live location
          const workerRes = await axios.get(
            `/api/v1/worker/${workerDetails._id}/location`
          );
          const wLoc = {
            lat: workerRes.data.data.lat,
            lng: workerRes.data.data.lng,
          };
          setWorkerLocation(wLoc);

          // Extract customer location from requestData (GeoJSON: [lng, lat])
          const cCoords = requestData.customerLocation?.coordinates || [];
          if (cCoords.length === 2) {
            const cLoc = { lat: cCoords[1], lng: cCoords[0] };
            setCustomerLocation(cLoc);

            // Fetch the actual road route from OpenRouteService
            const route = await getRoute(wLoc, cLoc);
            setRoutePath(route.coordinates);
            setEtaMinutes(Math.ceil(route.duration / 60));
          }
        } catch (err) {
          alert("Error while fetching worker location or route");
          console.log("Error while fetching worker location or route", err);
        }
      }
    };

    if (workerAccepted && requestData && workerDetails) {
      fetchLocations();
      interval = setInterval(fetchLocations, 5000);
    }
    return () => clearInterval(interval);
  }, [workerAccepted, requestData, workerDetails]);

  const cancelSearch = () => {
    axios
      .post(`/api/v1/service-request/${serviceRequestId}/delete-request`)
      .then(() => navigate("/customer/auth/home"))
      .catch((err) => {
        console.log("Something went wrong while deleting request", err);
        alert("Something went wrong while deleting request");
      });
  };

  const cancelReqAsByMistake = () => {
    axios
      .patch(
        `/api/v1/service-request/${serviceRequestId}/cancelled-by-customer-as-by-mistake`
      )
      .then(() => {
        setShowCancellButtons(false);
        requestData.orderStatus="cancelled";
      })
      .catch((err) => {
        console.log("Something went wrong while deleting request", err);
        alert("Something went wrong while deleting request");
      });
  };

  const cancelReqAsWorkerLateOrNotResponding = () => {
    axios
      .patch(
        `/api/v1/service-request/${serviceRequestId}/cancelled-by-customer-as-worker-not-responding-or-late`
      )
      .then(() => {
        setShowCancellButtons(false);
        requestData.orderStatus="cancelled"
      })
      .catch((err) => {
        console.log("Something went wrong while deleting request", err);
        alert("Something went wrong while deleting request");
      });
  };

  const quoteAccepted=()=>{
    axios.patch(`/api/v1/service-request/${serviceRequestId}/accept-repair-quote`)
    .then(()=>{
      setShowAcceptRejectButton(false);
      setShowPayButton(true);
    })
    .catch(()=>{
      alert("error while accepting req");
    })
  }

  const quoteRejected=()=>{
    axios.patch(`/api/v1/service-request/${serviceRequestId}/reject-repair-quote`)
    .then(()=>{
      setShowAcceptRejectButton(false);
      setShowPayButton(true);
    })
    .catch(()=>{
      alert("error while accepting req");
    })
  }

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

  // Step 1: Call backend to create Razorpay order
  try {
    const { data } = await axios.post(`/api/v1/payment/${serviceRequestId}/create-order`);
  
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
 // put your Razorpay Key ID in .env
      order_id: data.data.id,
      ...data.data,
      handler: async function (response) {
        const options={
          razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
        }
        axios.post(`/api/v1/payment/${serviceRequestId}/verify-payment`,options)
        .catch(()=>{
          alert("something went wrong in payment verification")
        })
      }
    };
  
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
      console.log(err);
      alert("Failed to initiate payment.");
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
          <div className="flex justify-center gap-3">
            <Button onClick={quoteAccepted} className="min-w-[250px]">Accept Repair Quote</Button>
            <Button onClick={quoteRejected} variant="destructive" className="min-w-[250px]">Reject Repair Quote</Button>
          </div>
        )}
        {showPayButton && (
          <Button onClick={handlePayment} className="min-w-[250px]">Pay Now</Button>
        )}
        {/* Live Map Card */}
        <div className="w-full max-w-2xl rounded-2xl shadow-lg bg-white overflow-hidden">
          <div className="h-80">
            {workerLocation && customerLocation && routePath.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Loading map...
              </div>
            )}
          </div>
        </div>
        {etaMinutes && (
          <div className="text-sm text-gray-700">
            Estimated arrival in:{" "}
            <span className="font-semibold">{etaMinutes} mins</span>
          </div>
        )}
        <div>
          🔵 Searching ➡️ 🤝 Connected ➡️ 🚗 On the way ➡️ 🏠 Arrived ➡️ 🧐
          Inspecting ➡️ 💬 Repair Quote provided ➡️ 🛠️ Repair ➡️ 💳 Payment ➡️
          ✅ Completed
        </div>
        <div className="w-full max-w-2xl  rounded-xl shadow bg-white p-4 flex gap-4 items-center">
          <img
            src={workerDetails.profilePhoto || "/default-worker.png"}
            alt="Worker"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-5">
              <div className="font-semibold text-lg">
                {workerDetails.fullName}
              </div>
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
          <div className="font-bold text-lg mb-2">Job Details</div>
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
      </div>
    );
  }
};

export default SearchingWorker;
