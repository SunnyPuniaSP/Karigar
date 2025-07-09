import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    fullName:"",
    email: "",
    phone: "",
    address: "",
    profilePhoto: "",
}

const customerAuthSlice = createSlice({
    name: "customerAuth",
    initialState,
    reducers: {
        setCustomerDetails: (state, action) => {
            const { fullName, email, phone, address, profilePhoto } = action.payload;
            state.fullName = fullName;
            state.email = email;
            state.phone = phone;
            state.address = address;
            state.profilePhoto = profilePhoto;
        },
        clearCustomerDetails: (state) => {
            state.fullName = "";
            state.email = "";
            state.phone = "";
            state.address = "";
            state.profilePhoto = "";
        },
    },
});

export const { setCustomerDetails, clearCustomerDetails } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;