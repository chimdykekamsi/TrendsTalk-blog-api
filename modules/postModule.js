const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title:{
        type:String,
        required:[true, "This field is required!"]
    },
    content:{
        type:String,
        required:[true, "This field is required!"]
    },
    tags: [
        {
            type: String,
            required: false,
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    views: [
        {
            viewer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }
    ],
    images: {
        type: Map,
        of: String,
        required: false,
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post",postSchema);