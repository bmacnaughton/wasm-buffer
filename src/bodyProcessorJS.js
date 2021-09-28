const StreamArray = require('stream-json/streamers/StreamArray');
const Readable = require('stream').Readable;


// this function assumes an JSON array body - will need a different approach for an JSON object body.
function processArrayBodyJS (req, res) {
    var startTime = process.hrtime();
    //let filtered = [];
    const rStream = new Readable();
    rStream._read = () => {}; // see:
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
    })

    rStream.push("[\n");

    //const pipeline = fs.createReadStream('./data/100Array.json').pipe(StreamArray.withParser());
    const pipeline = req.pipe(StreamArray.withParser());
    pipeline.on('data', data => {
        let str = JSON.stringify(data.value);
 
        if (isSuspicious(str)) {
            //filtered.push(data.value)
            rStream.push(str);
            rStream.push(", \n")
        } else {
            //filtered.push({});  // push an empty object so array position is maintained
            rStream.push("{},\n ");
        }
    });

    pipeline.on('end', function() { 
        rStream.push("\nnull\n]")
        rStream.push(null);
        elapsedTime = process.hrtime(startTime);
        console.log("Elapsed time (ms): ", elapsedTime[1]/1000000);
        //console.log(JSON.stringify(filtered)); 
    });

    rStream.pipe(res);
};
  
function isSuspicious(str) {
    //TODO: need to add check for starts with or ends with single dash (-) or has double dash (--) in the middle of the string
    //      did not inclue '+' since commonly used for phone number with country code
    let stopChars = ["'", "/", "\\", "#", "$", "%", "&", "<", ">", ";", "="];
    
    for (const letter of str) {
        for (const sChar of stopChars) {    
            if (sChar === letter) {
                return true;
            }
        }
    }
    return false;
};

module.exports = { processArrayBodyJS };