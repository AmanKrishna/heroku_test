// handling the /leaders and /leaders/:id endpoint
// this file is a node module on its own
const express = require('express');
const bodyParser = require('body-parser');
const Leaders = require('../model/leaders');
const authenticate = require('../authenticate');

// calling cors
const cors = require("./cors");

// leadertionRuter is now an express router
const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());
// this router will  be mounted on the index.js
// all the verbs will act at this endpoint '/' in this case
// I will chain all the verbs
// i only say slash becuase tthis router is mounted at /leaders
leaderRouter.route('/')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.cors,(req,res,next)=>{
    Leaders.find(req.query)
    .then((leaders)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(leaders);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Leaders.create(req.body)
    .then((leaders)=>{
        console.log("New Leader has been created!");
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(leaders);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on leaders");
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Leaders.remove({})
    .then((result)=>{
        console.log("Leaders have been deleted");
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(result);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

leaderRouter.route('/:leaderId')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.cors,(req,res,next)=>{
    Leaders.findById(req.params.leaderId)
    .then((leader)=>{
        if(leader!=null)
        {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(leader);
        }
        else{
            err = new Error("This Leader "+(req.params.leaderId)+" is not present in the database")
            err.status=404;
            return (next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/'+ req.params.leaderId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader)=>{
        if(leader!=null)
        {
            Leaders.findByIdAndUpdate(req.params.leaderId,{
                $set: req.body
            },{new:true})
            .then((leader)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(leader);
            },(err)=>next(err))
        }
        else{
            err = new Error("This Leader "+(req.params.leaderId)+" is not present in the database")
            err.status=404;
            return (next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((resp)=>{
      console.log("Leader Deleted!");
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json(resp);
  },(err)=>next(err))
  .catch((err)=>next(err));
});

module.exports = leaderRouter;