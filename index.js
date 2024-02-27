const express = require("express");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})