/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../ui/button";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import houseIc from "../../assets/3d-house.png";
import workerIc from "../../assets/mechanic.png";

// --- Routing function using OpenRouteService ---
const getRoute = async (start, end) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  const res = await axios.get(url);
  const coordinates = res.data.routes[0].geometry.coordinates;
  return coordinates.map(([lng, lat]) => [lat, lng]);
};

// --- Custom marker icons ---
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
        if (data.orderStatus === "connected" || data.orderStatus === "onway") {
          setWorkerAccepted(true);
          setLoading(false);
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
          alert("Worker accepted your request, but details couldn't be fetched.");
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
          const workerRes = await axios.get(`/api/v1/worker/${workerDetails._id}/location`);
          const wLoc = { lat: workerRes.data.data.lat, lng: workerRes.data.data.lng };
          setWorkerLocation(wLoc);

          // Extract customer location from requestData (GeoJSON: [lng, lat])
          const cCoords = requestData.customerLocation?.coordinates || [];
          if (cCoords.length === 2) {
            const cLoc = { lat: cCoords[1], lng: cCoords[0] };
            setCustomerLocation(cLoc);

            // Fetch the actual road route from OpenRouteService
            const route = await getRoute(wLoc, cLoc);
            setRoutePath(route);
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

  const STATUS_MAP = {
    connected: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "🤝",
      label: "Connected: Worker coming soon",
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
      label: "Quote provided",
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
    const { bg, text, icon, label } = STATUS_MAP[orderStatus] || STATUS_MAP.connected;
    return (
      <div
        className={`w-full max-w-2xl mx-auto flex items-center gap-4 px-6 py-4 rounded-xl shadow ${bg} ${text} mb-6`}
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
      <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10 px-2">
        <StatusBanner orderStatus={job.orderStatus} />

        {/* Live Map Card */}
        <div className="w-full max-w-2xl mb-8 rounded-2xl shadow-lg bg-white overflow-hidden">
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
                <FitBounds workerLocation={workerLocation} customerLocation={customerLocation} />
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[workerLocation.lat, workerLocation.lng]} icon={workerIcon}>
                  <Popup>Worker Current Location</Popup>
                </Marker>
                <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
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
        {/* Additional job/worker info and actions can go here */}
      </div>
    );
  }

  return null;
};

export default SearchingWorker;
