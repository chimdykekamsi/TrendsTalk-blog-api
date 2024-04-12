const mongoose = require("mongoose");

const categoryModel = mongoose.Schema({
    title: {
        type: String,
        require: [true, "title cannot be null"]
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Category",categoryModel);