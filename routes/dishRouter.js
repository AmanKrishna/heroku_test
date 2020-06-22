// handling the /dishes and /dishes/:id endpoint
// this file is a node module on its own
const express = require('express');
const bodyParser = require('body-parser');

// dishRuter is now an express router
const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
// this router will  be mounted on the index.js
// all the verbs will act at this endpoint '/' in this case
// I will chain all the verbs
// i only say slash becuase tthis router is mounted at /dishes
dishRouter.route('/')
// here dishes is an endpoint
.all((req,res,next)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    // next(): Look for additional specification down whihc 
    // will match this endpoint
    next();
})
// if get verb was called at the dishes endpoint
.get((req,res)=>{
    res.end('Will send all the dishes to you');
})
.post((req,res)=>{
    // post req will carry some data in JSON form
    // using app.use(bodyParser.json())
    // will extract this info as json and apllied to the body of the req
    res.end('Will add the dish: '+req.body.name+
        ' with details '+req.body.description);
})
.put((req,res)=>{
    res.statusCode=403;
    res.end("Put operation not supported on dishes");
})
.delete((req,res)=>{
    res.end("Deleting all the dishes");
});

dishRouter.route('/:dishId')
.all((req,res,next)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})
.get((req,res)=>{
    res.end("Fetching dish with Id: "+req.params.dishId);
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put((req, res) => {
    res.write('Updating the dish: ' + req.params.dishId + '\n');
    res.end('Will update the dish: ' + req.body.name + 
          ' with details: ' + req.body.description);
})
.delete((req, res) => {
      res.end('Deleting dish: ' + req.params.dishId);
  });
module.exports = dishRouter;