const mongoose = require("mongoose");


const userProfileStatus = new mongoose.Schema({
    userprofile:{
        firstname: {type:String, default:null},
        lastname: {type:String, default: null},
        email: {type:String, default:null},
        phone: {type:String, default:null}
    },
    googleFit: {type:Object, default:null},
},{timestamps:true});

module.exports = mongoose.model("userProfileStatus", userProfileStatus);
