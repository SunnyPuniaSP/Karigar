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
    yearOfExperience:""
}

const workerAuthSlice = createSlice({
    name: "workerAuth",
    initialState,
    reducers: {
        setWorkerDetails: (state, action) => {
            const { fullName, email, phone, address, profilePhoto, isOnline, workingCategory, isVerified, yearOfExperience} = action.payload;
            state.fullName = fullName;
            state.email = email;
            state.phone = phone;
            state.address = address;
            state.profilePhoto = profilePhoto;
            state.isOnline=isOnline;
            state.workingCategory=workingCategory;
            state.isVerified=isVerified;
            state.yearOfExperience=yearOfExperience;
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
    },
});

export const { setWorkerDetails, clearWorkerDetails } = workerAuthSlice.actions;
export default workerAuthSlice.reducer;