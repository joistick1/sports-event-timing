const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const morgan = require("morgan");
const bodyParser = require("body-parser");
const connection = require('./db');
const socketController = require("./api/controllers/socket");

const port = process.env.PORT || 3000;

//Routes
const homePageRoute = require("./api/routes/hp");
const sportsmenRoutes = require("./api/routes/sportsmen");
const resultsRoutes = require("./api/routes/results");

//connect to DB
connection
  .once('open', () => {
    console.log(`Mongo connection is opened, starting server..`)
  });
  
//Logging server actions
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Handle CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");

    if(req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Headers", "GET, POST, PUT, PATCH, DELETE");
        return res.status(200).json({});
    }

    next();
});

//binding socket
app.use((req, res, next) => {
  req.io = io;
  next();
});

//Routes which should handle requests
app.use("/", homePageRoute);
app.use("/sportsmen", sportsmenRoutes);
app.use("/results", resultsRoutes);

io.on('connection', socketController.manageResults);

http.listen(port, () => {
    console.log(`Starting server on localhost:${port}`)
});

module.exports = app;