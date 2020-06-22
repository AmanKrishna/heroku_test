// handling the /leaders and /leaders/:id endpoint
// this file is a node module on its own
const express = require('express');
const bodyParser = require('body-parser');

// leaderRuter is now an express router
const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());
// this router will  be mounted on the index.js
// all the verbs will act at this endpoint '/' in this case
// I will chain all the verbs
// i only say slash becuase tthis router is mounted at /leaders
leaderRouter.route('/')
// here leaders is an endpoint
.all((req,res,next)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    // next(): Look for additional specification down whihc 
    // will match this endpoint
    next();
})
// if get verb was called at the leaders endpoint
.get((req,res)=>{
    res.end('Will send all the leaders to you');
})
.post((req,res)=>{
    // post req will carry some data in JSON form
    // using app.use(bodyParser.json())
    // will extract this info as json and apllied to the body of the req
    res.end('Will add the leader: '+req.body.name+
        ' with details '+req.body.description);
})
.put((req,res)=>{
    res.statusCode=403;
    res.end("Put operation not supported on leaders");
})
.delete((req,res)=>{
    res.end("Deleting all the leaders");
});

leaderRouter.route('/:leaderId')
.all((req,res,next)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})
.get((req,res)=>{
    res.end("Fetching leader with Id: "+req.params.leaderId);
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/'+ req.params.leaderId);
})
.put((req, res) => {
    res.write('Updating the leader: ' + req.params.leaderId + '\n');
    res.end('Will update the leader: ' + req.body.name + 
          ' with details: ' + req.body.description);
})
.delete((req, res) => {
      res.end('Deleting leader: ' + req.params.leaderId);
  });
module.exports = leaderRouter;