const router = require('express').Router();
const { processArrayBodyJS } = require('./bodyProcessorJS');
const { processArrayBodyWASM } = require('./bodyProcessorWASM');
const { processArrayBodyWASM2 } = require('./bodyProcessorWASM');
const fs = require('fs');
const path = require('path');

router.get(
    '/', 
    (req, res) => res.send('Hello World!')
);

router.post(
    '/js', 
    (req, res, next) => processArrayBodyJS(req, res, next)
);

router.post(
    '/echo', 
    (req, res, next) => {
        req.on('end', () => res.end());
        req.pipe(res) 
});

router.post(
    '/wasm',
    (req, res, next) => processArrayBodyWASM(req, res, next)
);

router.post(
    '/wasm2',
    (req, res, next) => processArrayBodyWASM2(req, res, next)
);

router.post(
    '/store',
    (req, res, next) => storeRequest(req, res, next)
);

function storeRequest(req, res, next) {
    req.pipe(fs.createWriteStream(path.join('./uploadedFiles', Date.now().toString() + '.json')));
    req.on('end', () => {
        res.end('Upload complete');
        next();
    })
};

module.exports = router;