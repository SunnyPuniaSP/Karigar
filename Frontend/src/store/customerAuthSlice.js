import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    fullName:"",
    email: "",
    phone: "",
    address: "",
    profilePhoto: "",
    liveServiceId: null,
    isLiveRequest:false
}

const customerAuthSlice = createSlice({
    name: "customerAuth",
    initialState,
    reducers: {
        setCustomerDetails: (state, action) => {
            const { fullName, email, phone, address, profilePhoto,liveServiceId, isLiveRequest } = action.payload;
            state.fullName = fullName;
            state.email = email;
            state.phone = phone;
            state.address = address;
            state.profilePhoto = profilePhoto;
            state.liveServiceId = liveServiceId;
            state.isLiveRequest = isLiveRequest;
        },
        setLiveServiceId:(state,action)=>{
            state.liveServiceId = action.payload;
        },
        setIsLiveRequest:(state)=>{
            state.isLiveRequest=true;
        },
        clearCustomerDetails: (state) => {
            state.fullName = "";
            state.email = "";
            state.phone = "";
            state.address = "";
            state.profilePhoto = "";
        },
        clearLiveServiceId:(state)=>{
            state.liveServiceId=null;
        },
        clearIsLiveRequest:(state)=>{
            state.isLiveRequest=false;
        }

    },
});

export const { setCustomerDetails, setLiveServiceId, setIsLiveRequest, clearCustomerDetails, clearLiveServiceId, clearIsLiveRequest} = customerAuthSlice.actions;
export default customerAuthSlice.reducer;