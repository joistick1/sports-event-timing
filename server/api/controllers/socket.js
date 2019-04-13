
const dbService = require("../../db-service");
const Result = require("../../db/models/result");
const resultsController = require("../controllers/results");
const request = require('request');
const connection = require("../../db");

async function makeGetRequest(uri, method, payload) {
    const options = {
        uri: uri,
        method: method
    }
    await request(options, (error, response) => {
        if (error) {
            console.error(error);
        }
        return;
    });
}

async function makePOSTRequest(uri, method, payload) {
    const options = {
        uri: uri,
        body: JSON.stringify(payload),
        method: method,
        headers: {
        'Content-Type': 'application/json'
        }
    };
    request(options, (error, response) => {
        if (error) {
        console.error(error);
        }
        return;
    });
}
exports.manageResults = socket => {
    const latest_time_ts = new Date().getTime() 
    // socket.emit('reloadPage', latest_time_ts )
    Result.find({}, (err, data) => {
        socket.emit('currentData', {data, latest_time_ts});
    });
    // const payload = {
    //     "started": false,
    //     "finished": false,
    //     "latest_time_ts": new Date().getTime() 
    // }
    // makePOSTRequest('http://localhost:3000/results/status', 'PATCH', payload);
    socket.on('start', () => {
        const payload = {
            "started": true,
            "finished": false,
            "latest_time_ts": new Date().getTime() 
        }
        makeGetRequest('http://localhost:4000/start', 'GET');
        makePOSTRequest('http://localhost:3000/results/status', 'PATCH', payload);
        socket.emit('started');
        dbService.dropCollection(connection) 
        dbService.createCollection(Result) 
        
    });

    socket.on('finished', () => {
        const payload = {
            "started": false,
            "finished": true,
            "latest_time_ts": new Date().getTime() 
        }
        makePOSTRequest('http://localhost:3000/results/status', 'PATCH', payload);  
    });

    socket.on("disconnect", () => {
        console.log("DISCONNECTED");
        
    });
}
