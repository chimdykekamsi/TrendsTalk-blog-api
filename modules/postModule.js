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
            required: [true, "This field is required"],
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
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post",postSchema);