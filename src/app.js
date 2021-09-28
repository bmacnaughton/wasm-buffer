const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000

app.use('/routes', require('./routes'));

app.post('/store-to-file', (req, res, next) => {
    req.pipe(fs.createWriteStream(path.join('./uploadedFiles', Date.now().toString() + '.txt')));
    req.on('end', () => {
        res.end('Upload complete');
        next();
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
