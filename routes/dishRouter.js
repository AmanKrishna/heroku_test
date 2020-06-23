// handling the /dishes and /dishes/:id endpoint
// this file is a node module on its own
const express = require('express');
const bodyParser = require('body-parser');

// connecting with the db server!
const mongoose = require('mongoose');
const Dishes = require('../model/dishes');

// dishRuter is now an express router
const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
// this router will  be mounted on the index.js
// all the verbs will act at this endpoint '/' in this case
// I will chain all the verbs
// i only say slash becuase tthis router is mounted at /dishes
dishRouter.route('/')
// if get verb was called at the dishes endpoint
// then takes two params one to be executed on success and
// one on failure
.get((req,res,next)=>{
    Dishes.find({})
    .then((dishes)=>{
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    // the data to be POSTED is in the body of the request
    Dishes.create(req.body)
    // if the dish is successfully added perform this
    .then((dishes)=>{
        console.log("Dish Created!");
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on dishes");
})
.delete((req,res,next)=>{
    Dishes.remove({})
    .then((resp)=>{
        console.log("Dish Created!");
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

dishRouter.route('/:dishId')
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dishes)=>{
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req, res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put((req, res,next) => {
    Dishes.findByIdAndUpdate(req.params.dishId,{
        $set : req.body
    },{new: true})
    .then((dish)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete((req, res,next) => {
      Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp)=>{
        console.log("Dish Deleted!");
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
  });
module.exports = dishRouter;