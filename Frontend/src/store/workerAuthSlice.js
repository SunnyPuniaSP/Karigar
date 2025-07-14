import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    fullName:"",
    email: "",
    phone: "",
    address: "",
    profilePhoto: "",
    isOnline:false,
    workingCategory:[],
    isVerified:false,
    yearOfExperience:"",
    liveServiceId: null,
    isLiveRequest:false
}

const workerAuthSlice = createSlice({
    name: "workerAuth",
    initialState,
    reducers: {
        setWorkerDetails: (state, action) => {
            const { fullName, email, phone, address, profilePhoto, isOnline, workingCategory, isVerified, yearOfExperience, liveServiceId, isLiveRequest} = action.payload;
            state.fullName = fullName;
            state.email = email;
            state.phone = phone;
            state.address = address;
            state.profilePhoto = profilePhoto;
            state.isOnline=isOnline;
            state.workingCategory=workingCategory;
            state.isVerified=isVerified;
            state.yearOfExperience=yearOfExperience;
            state.liveServiceId = liveServiceId;
            state.isLiveRequest = isLiveRequest;
        },
        setLiveServiceId:(state,action)=>{
            state.liveServiceId = action.payload;
        },
        setIsLiveRequest:(state)=>{
            state.isLiveRequest=true;
        },
        clearWorkerDetails: (state) => {
            state.fullName = "";
            state.email = "";
            state.phone = "";
            state.address = "";
            state.profilePhoto = "";
            state.isOnline=false;
            state.workingCategory=[];
            state.isVerified=false;
        },
        clearLiveServiceId:(state)=>{
            state.liveServiceId=null;
        },
        clearIsLiveRequest:(state)=>{
            state.isLiveRequest=false;
        }
    },
});

export const { setWorkerDetails, setLiveServiceId, setIsLiveRequest, clearWorkerDetails, clearLiveServiceId, clearIsLiveRequest } = workerAuthSlice.actions;
export default workerAuthSlice.reducer;