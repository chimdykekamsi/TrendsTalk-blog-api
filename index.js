const express = require("express");
const _db = require("./config/dbConnection");
require("dotenv").config();
const cors = require("cors"); 
const path = require("path")

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load('./utils/swagger.yaml');

const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const categoryRoute = require("./routes/categoryRoute");
const errorHandler = require("./middlewares/errorHandler");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "*",
    methods: 'GET,HEAD,PUT,POST,DELETE',
    credentials: true,
}));

app.use(express.json());
app.use(errorHandler);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/categories', categoryRoute);


app.use("/docs",swaggerUi.serve,swaggerUi.setup(swaggerJsDocs));

_db().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on PORT ${PORT}`);
    });
});