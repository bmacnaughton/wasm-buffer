'use strict';

const fs = require('fs');
const path = require('path');

const router = require('express').Router();
const { processArrayBodyJS } = require('./bodyProcessorJS');

const scanners = {};
scanners.wasm = { Scanner: require('../pkg').Scanner };
scanners.napi = {
  Scanner: require('../package-template.linux-x64-gnu.node').Scanner
};
scanners.js = { Scanner: require('./scanner.js') };

scanners.js.stopChars = ";$'</\\&#%>=";
scanners.napi.stopChars = Buffer.from(scanners.js.stopChars);
scanners.wasm.stopChars = new Uint8Array(scanners.napi.stopChars);

scanners.js.preprocess = (b) => b;
scanners.napi.preprocess = (b) => b;
scanners.wasm.preprocess = (b) => new Uint8Array(b);

router.get('/', (req, res) =>
  res.send('Hello World!')
);

router.post('/echo', (req, res, next) => {
  req.on('end', () => res.end());
  req.pipe(res);
});

router.post('/scan/:how', async function (req, res) {
  const start = process.hrtime.bigint();
  const s = await processBodyUsing(req.params.how, req);
  const delta = process.hrtime.bigint() - start;

  res.send({suspicious: s, time: Number(delta)});
});

async function processBodyUsing(type, req) {
  const { Scanner, stopChars, preprocess } = scanners[type];

  // they take different formats of stop characters
  const s = new Scanner(stopChars);

  let suspicious = false;
  for await (const buffer of req) {
    if (s.suspicious(preprocess(buffer))) {
      suspicious = true;
    }
  }

  return suspicious;
}

function storeRequest(req, res, next) {
    req.pipe(fs.createWriteStream(path.join('./uploadedFiles', Date.now().toString() + '.json')));
    req.on('end', () => {
        res.end('Upload complete');
        next();
    })
};

module.exports = router;
