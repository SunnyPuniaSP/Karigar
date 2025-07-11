import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ServiceRequestForm = () => {
  const navigate=useNavigate();
  const {category}=useParams();
  

  const [message, setMessage] = useState("");
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [locationCoords, setLocationCoords] = useState({ lat: null, lon: null });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location access denied:", error);
          alert("Please allow location access for better results.");
        }
      );
    } else {
      alert("Geolocation not supported by your browser.");
    }
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setAudioBlob(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = () => {
    const formData=new FormData();
    formData.append("description",message);
    if(audioBlob)formData.append("audioNote",audioBlob);
     if (!locationCoords.lat || !locationCoords.lon) {
      alert("Location not found. Please allow location access.");
      return;
    }
    
    formData.append("latitude", locationCoords.lat);
    formData.append("longitude", locationCoords.lon);

    axios.post(`/api/v1/service-request/${category}/create`,formData)
    .then((res)=>{
        navigate(`/customer/auth/service-request/${res.data.data._id}`)
    })
    .catch(()=>{
        alert("something went wrong request not created")
    })

  };

  const cancelAudio=()=>{
    setAudioURL(null);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-start">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        {category} Service Request
      </h1>

      <div className="bg-white rounded-2xl shadow-md w-full max-w-xl p-6 space-y-6">
        {/* Optional Text Message */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Message (optional)
          </label>
          <textarea
            rows="4"
            
            placeholder="Describe your issue..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Optional Audio Recording */}
        <div>
  <label className="block text-lg font-semibold mb-2 text-gray-700">
    Audio Message (optional)
  </label>

  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
    {/* Start or Stop Recording */}
    {!isRecording ? (
      <button
        onClick={startRecording}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        🎤 Start Recording
      </button>
    ) : (
      <button
        onClick={stopRecording}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
      >
        ⏹️ Stop Recording
      </button>
    )}

    {/* Cancel Button */}
    {audioURL && !isRecording && (
      <button
        onClick={cancelAudio}
        className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition"
      >
        ❌ Cancel Audio
      </button>
    )}
  </div>

  {/* Preview Audio */}
  {!isRecording && audioURL && (
    <audio controls className="w-full mt-3">
      <source src={audioURL} type="audio/webm" />
      Your browser does not support the audio element.
    </audio>
  )}
</div>


        {/* Search Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all"
          >
            🔍 Search Worker
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestForm;
