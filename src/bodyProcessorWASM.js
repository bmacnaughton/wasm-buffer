const { is_suspicious } = require('../pkg/simple_wasm')
const { is_suspicious_2 } = require('../pkg/simple_wasm')
const StreamArray = require('stream-json/streamers/StreamArray');
const Readable = require('stream').Readable;

// this function assumes an JSON array body - will need a different approach for an JSON object body.
function processArrayBodyWASM (req, res) {
    var startTime = process.hrtime();
    const rStream = new Readable();
    rStream._read = () => {}; 
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
    })

    rStream.push("[\n");

    const pipeline = req.pipe(StreamArray.withParser());
    pipeline.on('data', data => {
        let str = JSON.stringify(data.value);
 
        if (is_suspicious(str)) { 
            rStream.push(str);
            rStream.push(", \n")
        } else {
            rStream.push("{},\n ");
        }
    });

    pipeline.on('end', function() { 
        rStream.push("\nnull\n]")
        rStream.push(null);
        elapsedTime = process.hrtime(startTime);
        console.log("Elapsed time (ms): ", elapsedTime[1]/1000000);
    });

    rStream.pipe(res);
};

function processArrayBodyWASM2 (req, res) {
    var startTime = process.hrtime();
    const rStream = new Readable();
    rStream._read = () => {}; 
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
    })

    rStream.push("[\n");

    const pipeline = req.pipe(StreamArray.withParser());
    pipeline.on('data', data => {
        let str = JSON.stringify(data.value);
 
        if (is_suspicious_2(str)) { 
            rStream.push(str);
            rStream.push(", \n")
        } else {
            rStream.push("{},\n ");
        }
    });

    pipeline.on('end', function() { 
        rStream.push("\nnull\n]")
        rStream.push(null);
        elapsedTime = process.hrtime(startTime);
        console.log("Elapsed time (ms): ", elapsedTime[1]/1000000);
    });

    rStream.pipe(res);
};


module.exports = { 
    processArrayBodyWASM, 
    processArrayBodyWASM2
};