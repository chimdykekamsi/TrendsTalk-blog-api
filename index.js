const express = require("express");
const _db = require("./config/dbConnection");
require("dotenv").config();
const authRoute = require("./routes/authRoute")
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/auth',authRoute)


_db().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server running on PORT ${PORT}`);
    })
})