const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true, "This field is required!"]
    },
    email:{
        type:String,
        required:[true, "This field is required!"]
    },
    password:{
        type:String,
        required:[true, "This field is required!"]
    },
    role:{
        type:String,
        required:false,
        default:"reader"
    }
},
    {
        timesstamps: true
    }
)

module.exports = mongoose.model("User", userSchema);