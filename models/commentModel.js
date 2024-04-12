const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comment:{
        type:String,
        required:[true, "This field is required!"]
    },
    likes: [
        {
            liker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    dislikes: [
        {
            disliker: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ]
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("comment",commentSchema);