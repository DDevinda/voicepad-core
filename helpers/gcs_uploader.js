const {Storage} = require("@google-cloud/storage");
const path = require("path");

const CLOUD_BUCKET = 'sst-chain-test';

const gc = new Storage({
    keyFilename: 'chain analytics-7725b1dff86f.json',
    projectId: 'chain-analytics'
});

// get list of existing buckets
// const checkBuckets = () => gc.getBuckets().then(x => console.log(x));

const chain_test_bucket = gc.bucket('sst-chain-test');

const getPublicUrl = (filename) => {
    return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`
  }

const sendUploadToGCS = (req, res, next) => {
    if(!req.file){
        return next()
    }

    const gcsname = Date.now() + req.file.originalname
    const file = chain_test_bucket.file(gcsname);

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    });

    stream.on('error', (err) => {
        req.file.cloudStorageError = err
        next(err)
    })

    stream.on('finish', (err) => {
        req.file.cloudStorageObject = gcsname
        file.makePublic().then(() => {
            // req.file.cloudStoragePublicUrl = getPublicUrl(gcsname)
            res.status(200).send(`Success!`)
            next()
        }).catch((err) => {
            console.log(err);
        })
    })

    stream.end(req.file.buffer)

}

module.exports = {
    getPublicUrl,
    sendUploadToGCS,
    // checkBuckets
}