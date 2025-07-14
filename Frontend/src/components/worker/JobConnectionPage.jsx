/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
import {
  clearIsLiveRequest,
  clearLiveServiceId,
} from "../../store/workerAuthSlice";
import { useDispatch } from "react-redux";

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
  const dispatch = useDispatch();
  const { serviceRequestId } = useParams();
  const [requestData, setRequestData] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);

  // Map-related state
  const [workerLocation, setWorkerLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [etaMinutes, setEtaMinutes] = useState(null);

  const [showQuoteAmountFields, setShowQuoteAmountFields] = useState(false);
  const [showInspectingButton, setShowInspectingButton] = useState(false);
  const [showReceivePaymentButton, setShowReceivePaymentButton] =
    useState(false);
  const [quoteAmount, setQuoteAmount] = useState();

  const [showCancelNotAbleToServe, setShowCancellNotAbleToServe] =
    useState(true);
  const [showCancelCustomerNotResponding, setShowCancellCustomerNotResponding] =
    useState(false);

  const toggleIsLiveRequestToFalse = useRef(false);

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
        if(data.orderStatus!=="connected" && data.orderStatus!=="onway"){
          setShowCancellNotAbleToServe(false);
        }
        if (data.orderStatus === "arrived") {
          setShowInspectingButton(true);
          setShowCancellNotAbleToServe(false);
          setShowCancellCustomerNotResponding(true);
        }
        if (data.orderStatus === "inspecting") {
          setShowQuoteAmountFields(true);
          setShowCancellCustomerNotResponding(false);
        }
        if (
          data.orderStatus === "payment_pending_visiting_fee" ||
          data.orderStatus === "payment_pending_quote_amount"
        ) {
          setShowReceivePaymentButton(true);
        }
        if (
          data.orderStatus === "completed" &&
          !toggleIsLiveRequestToFalse.current
        ) {
          setShowReceivePaymentButton(false);
          axios
            .patch(
              `/api/v1/worker/${data.workerId}/toggle-isliveRequestTo-false`
            )
            .then(() => {
              dispatch(clearIsLiveRequest());
              dispatch(clearLiveServiceId());
            })
            .catch(() => {
              alert("toglling is live request to false failed");
            });
          toggleIsLiveRequestToFalse.current = true;
        }
        if (
          data.orderStatus === "cancelled" &&
          !toggleIsLiveRequestToFalse.current
        ) {
          setShowCancellNotAbleToServe(false);
          axios
            .patch(
              `/api/v1/worker/${data.workerId}/toggle-isliveRequestTo-false`
            )
            .then(() => {
              dispatch(clearIsLiveRequest());
              dispatch(clearLiveServiceId());
            })
            .catch(() => {
              alert("toglling is live request to false failed");
            });
          toggleIsLiveRequestToFalse.current = true;
        }
      })
      .catch((error) => {
        console.error("Error fetching request status", error);
        alert("Something went wrong while checking the request status");
      });
  };

  useEffect(() => {
    if (!requestData?.customerId) return;

    axios
      .get(`/api/v1/customer/${requestData.customerId}/customerDetails`)
      .then((res) => {
        setCustomerDetails(res.data.data);
      })
      .catch(() => {
        alert("failed to get customer details");
      });
  }, [requestData]);

  useEffect(() => {
    let locationUpdateInterval;

    const updateWorkerLocation = () => {
      if (!requestData?.workerId) return;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          axios
            .patch(
              `/api/v1/worker/${serviceRequestId}/update-current-location`,
              {
                latitude,
                longitude,
              }
            )
            .catch(() => {
              alert("Failed to update worker location");
            });
        },
        (err) => {
          console.error("Geolocation error", err);
        }
      );
    };

    if (requestData?.workerId) {
      updateWorkerLocation(); // Call once immediately
      locationUpdateInterval = setInterval(updateWorkerLocation, 5000); // Poll every 5 seconds
    }

    return () => clearInterval(locationUpdateInterval);
  }, [requestData?.workerId]);

  // Poll for worker and customer locations and fetch the real route
  useEffect(() => {
    let interval;
    const fetchLocations = async () => {
      if (requestData?.workerId) {
        try {
          // Fetch worker's live location
          const workerRes = await axios.get(
            `/api/v1/worker/${requestData.workerId}/location`
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

    if (requestData?.workerId) {
      fetchLocations();
      interval = setInterval(fetchLocations, 5000);
    }
    return () => clearInterval(interval);
  }, [requestData]);

  const startInspection = () => {
    axios
      .patch(
        `/api/v1/service-request/${serviceRequestId}/update-status-to-inspecting`
      )
      .then(() => {
        setShowInspectingButton(false);
      })
      .catch(() => {
        alert("error while updating status to inspecting");
      });
  };

  const sendQuoteAmount = () => {
    axios
      .patch(
        `/api/v1/service-request/${serviceRequestId}/update-quote-amount`,
        { quoteAmount }
      )
      .then(() => {
        setShowQuoteAmountFields(false);
      })
      .catch(() => {
        alert("error while updating quote amount");
      });
  };

  const paymentReceived = () => {
    axios
      .patch(
        `/api/v1/service-request/${serviceRequestId}/payment-received-cash`
      )
      .then(() => {
        setShowReceivePaymentButton(false);
      })
      .catch(() => {
        alert("error while updating job status on payment received in cash");
      });
  };

  const notAbleToServe = () => {
    axios
      .patch(
        `/api/v1/service-request/${serviceRequestId}/cancelled-by-worker-as-not-able-to-serve`
      )
      .then(() => {
        dispatch(clearIsLiveRequest());
        dispatch(clearLiveServiceId());
        setShowCancellNotAbleToServe(false);
      })
      .catch(() => {
        alert("something went wrong while cancelling request");
      });
  };

  const customerNotResponding = () => {
    axios
      .patch(
        `/api/v1/service-request/${serviceRequestId}/cancelled-by-worker-as-customer-not-responding`
      )
      .then(() => {
        dispatch(clearIsLiveRequest());
        dispatch(clearLiveServiceId());
        setShowCancellCustomerNotResponding(false);
        setShowInspectingButton(false);
      })
      .catch(() => {
        alert("something went wrong while cancelling request");
      });
  };

  const STATUS_MAP = {
    connected: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "🔗",
      label: "Connected to customer",
    },
    onway: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "🚗",
      label: "You are on the way",
    },
    arrived: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "📍",
      label: "You have arrived at the location",
    },
    inspecting: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      icon: "🛠️",
      label: "You are inspecting the issue",
    },
    repairAmountQuoted: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "📄",
      label: "Waiting for Customer Approval",
    },
    payment_pending_quote_amount: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "💳",
      label: "Waiting for quote payment",
    },
    payment_pending_visiting_fee: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "💰",
      label: "Waiting for visiting fee",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "✅",
      label: "Job completed successfully",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "❌",
      label: "Request was cancelled",
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

  if (!requestData) {
    return <div>loading...</div>;
  }
  const job = requestData;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10 px-2 gap-5">
      <StatusBanner orderStatus={job.orderStatus} />
      {showCancelNotAbleToServe && (
        <Button variant="destructive" onClick={notAbleToServe}>
          Cancel
        </Button>
      )}
      <div className="flex gap-3 justify-center">
        {showCancelCustomerNotResponding && (
        <Button variant="destructive" onClick={customerNotResponding}>Customer Not Responding</Button>
      )}
      {showInspectingButton && (
        <Button onClick={startInspection} className="w-[200px]">Start Inspecting</Button>
      )}
      </div>
      {showQuoteAmountFields && (
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl shadow-md w-full max-w-md mx-auto">
          <input
            onChange={(e) => setQuoteAmount(e.target.value)}
            type="number"
            name="quoteAmount"
            placeholder="Enter Quote Amount"
            className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <Button
            onClick={sendQuoteAmount}
            className="font-medium py-2 px-6 rounded-lg shadow transition"
          >
            Submit
          </Button>
        </div>
      )}
      {showReceivePaymentButton && (
        <Button onClick={paymentReceived}>Payment Received in Cash</Button>
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
          Estimated Reaching in:{" "}
          <span className="font-semibold">{etaMinutes + 10} mins</span>
        </div>
      )}
      {workerLocation && customerLocation && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${workerLocation.lat},${workerLocation.lng}&destination=${customerLocation.lat},${customerLocation.lng}&travelmode=driving`}
          target="_blank"
        >
          <Button>📍 Open in Google Maps</Button>
        </a>
      )}

      {customerDetails && (
        <div className="w-full max-w-2xl  rounded-xl shadow bg-white p-4 flex gap-4 items-center">
          <img
            src={
              customerDetails.profilePhoto ||
              "https://th.bing.com/th/id/OIP.6UhgwprABi3-dz8Qs85FvwHaHa?w=205&h=205&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
            }
            alt="Worker"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex flex-col gap-2">
            <div style={{ color: "#0B1D3A" }} className="text-lg font-bold">
              Customer Details
            </div>
            <div>Name: {customerDetails.fullName}</div>
            <div>Phone: {customerDetails.phone}</div>
          </div>
        </div>
      )}
      <div className="w-full max-w-2xl rounded-xl shadow bg-white p-4">
        <div style={{ color: "#0B1D3A" }} className="font-bold text-lg mb-2">
          Job Details
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-700">Category: {job.category}</div>
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
};

export default SearchingWorker;
