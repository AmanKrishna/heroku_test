// handling the /promotions and /promotions/:id endpoint
// this file is a node module on its own
const express = require('express');
const bodyParser = require('body-parser');

// promotionRuter is now an express router
const promoRouter = express.Router();
promoRouter.use(bodyParser.json());
// this router will  be mounted on the index.js
// all the verbs will act at this endpoint '/' in this case
// I will chain all the verbs
// i only say slash becuase tthis router is mounted at /promotions
promoRouter.route('/')
// here promotions is an endpoint
.all((req,res,next)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    // next(): Look for additional specification down whihc 
    // will match this endpoint
    next();
})
// if get verb was called at the promotions endpoint
.get((req,res)=>{
    res.end('Will send all the promotions to you');
})
.post((req,res)=>{
    // post req will carry some data in JSON form
    // using app.use(bodyParser.json())
    // will extract this info as json and apllied to the body of the req
    res.end('Will add the promotion: '+req.body.name+
        ' with details '+req.body.description);
})
.put((req,res)=>{
    res.statusCode=403;
    res.end("Put operation not supported on promotions");
})
.delete((req,res)=>{
    res.end("Deleting all the promotions");
});

promoRouter.route('/:promoId')
.all((req,res,next)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})
.get((req,res)=>{
    res.end("Fetching promotion with Id: "+req.params.promoId);
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'+ req.params.promoId);
})
.put((req, res) => {
    res.write('Updating the promotion: ' + req.params.promoId + '\n');
    res.end('Will update the promotion: ' + req.body.name + 
          ' with details: ' + req.body.description);
})
.delete((req, res) => {
      res.end('Deleting promotion: ' + req.params.promoId);
  });
module.exports = promoRouter;