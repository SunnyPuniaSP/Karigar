import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../ui/button";
import Loader from "../style/Loader.jsx";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/pages/ui/sheet";
import { Pencil } from "lucide-react";
import api from "../../api.js";
import { setCustomerDetails } from "../../store/customerAuthSlice";
import { toast } from "sonner";

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const { fullName, email, phone, address, profilePhoto } = useSelector(
    (state) => state.customerAuth
  );

  const [formData, setFormData] = useState({ fullName, email, phone, address });
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loader, setLoader] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setLoader(true);
    api
      .post("/api/v1/customer/update-customer-details", formData)
      .then((res) => {
        dispatch(setCustomerDetails(res.data.data));
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

  const handlePhotoEdit = () => {
    setIsEditingPhoto(true);
  };

  const handlePhotoSave = async () => {
    if (!selectedFile) {
      setIsEditingPhoto(false);
      setSelectedFile(null);
      return;
    }
    setLoader(true);
    const formData = new FormData();
    formData.append("profilePhoto", selectedFile);
    api
      .patch("/api/v1/customer/update-profilePhoto", formData)
      .then((res) => {
        dispatch(setCustomerDetails(res.data.data));
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
        setIsEditingPhoto(false);
        setSelectedFile(null);
        setLoader(false);
      });
  };

  const defaultPhoto =
    "https://th.bing.com/th/id/OIP.6UhgwprABi3-dz8Qs85FvwHaHa?w=205&h=205&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex gap-10">
      <div className="w-[320px] bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg rounded-3xl p-6 text-center relative">
        <div className="relative w-36 h-36 mx-auto mb-4">
          <img
            src={profilePhoto ? profilePhoto : defaultPhoto}
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
            alt="Profile"
          />
          <button
            onClick={handlePhotoEdit}
            className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow"
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </button>
        </div>

        {isEditingPhoto && (
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-4 mt-4">
              <label
                htmlFor="profilePhotoInput"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium shadow"
              >
                Choose Image
              </label>
              <input
                type="file"
                id="profilePhotoInput"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              {selectedFile && (
                <span className="text-sm text-gray-700">
                  {selectedFile.name}
                </span>
              )}
            </div>
            <Button onClick={handlePhotoSave}>Save Photo</Button>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-800">{fullName}</h2>
        <p className="text-sm text-gray-500">{email}</p>
        <p className="text-sm text-gray-500">{phone}</p>
        <p className="text-sm text-gray-500">{address}</p>
      </div>
      <div className="flex-1 bg-white shadow-md rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Profile Info</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default">Edit Profile</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[500px] p-5">
              <SheetHeader>
                <SheetTitle className="text-xl">Update Your Details</SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-5">
                {["fullName", "email", "phone", "address"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium capitalize text-gray-600 mb-1">
                      {field === "fullName" ? "Full Name" : field}
                    </label>
                    {field === "address" ? (
                      <textarea
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border rounded-md p-2 bg-white"
                      />
                    ) : (
                      <input
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full border rounded-md p-2 bg-white"
                      />
                    )}
                  </div>
                ))}
              </div>

              <SheetFooter className="mt-6 flex-col gap-2">
                <Button onClick={handleSave}>Save</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <div className="text-base font-medium text-gray-800">
              {fullName}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <div className="text-base font-medium text-gray-800">{email}</div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <div className="text-base font-medium text-gray-800">{phone}</div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Address</label>
            <div className="text-base font-medium text-gray-800 whitespace-pre-line">
              {address}
            </div>
          </div>
        </div>
      </div>
      {loader && <Loader />}
    </div>
  );
};

export default CustomerProfile;
