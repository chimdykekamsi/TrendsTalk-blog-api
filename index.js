const express = require("express");
const _db = require("./config/dbConnection");
require("dotenv").config();
const cors = require("cors");  // Import the cors middleware
const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const errorHandler = require("./middlewares/errorHandler");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,POST,DELETE',
    credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);

app.use(errorHandler);

_db().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on PORT ${PORT}`);
    });
});