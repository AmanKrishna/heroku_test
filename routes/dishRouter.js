// handling the /dishes and /dishes/:id endpoint
// this file is a node module on its own
const express = require('express');
const bodyParser = require('body-parser');

// connecting with the db server!
const mongoose = require('mongoose');
const Dishes = require('../model/dishes');
const authenticate = require('../authenticate');

// calling cors
const cors = require("./cors");


// dishRuter is now an express router
const dishRouter = express.Router();
dishRouter.use(bodyParser.json());


// this router will  be mounted on the index.js
// all the verbs will act at this endpoint '/' in this case
// I will chain all the verbs
// i only say slash becuase tthis router is mounted at /dishes
dishRouter.route('/')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
// if get verb was called at the dishes endpoint
// then takes two params one to be executed on success and
// one on failure
.get(cors.cors,(req,res,next)=>{
    Dishes.find(req.query)
    // populate the author field in comment schema inside dish schema
    // .populate('comments.author')
    .then((dishes)=>{
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
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
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on dishes");
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    console.log("ASDASDAS")
    Dishes.remove({})
    .then((resp)=>{
        console.log("Dishes Deleted!");
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

dishRouter.route('/:dishId')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.cors,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    // populate the author field in comment schema inside dish schema
    .populate('comments.author')
    .then((dishes)=>{
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
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
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
      Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp)=>{
        console.log("Dish Deleted!");
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
  });

//   Handling the Schema inside a schema, schemaception

dishRouter.route('/:dishId/comments')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
// if get verb was called at the dishes endpoint
// then takes two params one to be executed on success and
// one on failure
.get(cors.cors,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    // populate the author field in comment schema inside dish schema
    .populate('comments.author')
    .then((dish)=>{
        if(dish!=null)
        {
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(dish.comments);
        }
        else{
            err = new Error("Dish "+req.params.dishId+" Not Found");
            err.status=404;
            return next(err);
        }
        
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    // the data to be POSTED is in the body of the request
    Dishes.findById(req.params.dishId)
    // if the dish is successfully added perform this
    .then((dish)=>{
    if(dish!=null)
    {
    // req.body no longer has user info inside body
    // it will only contain the rating field and the comment field 
    // I want my server to automatically determine which user made the comment
        req.body.author = req.user._id
        dish.comments.push(req.body);
        dish.save()
    //   if dish comment is saved successfully then
        .then((dish)=>{
            Dishes.findById(dish._id)
            // I have pushed the reference into the comment schema
            // time to populate it
            .populate('comments.author')
            .then((dish)=>{
                console.log(dish)
                res.statusCode=200;
                res.setHeader('Content-type','application/json');
                res.json(dish);
            })
        },(err)=>next(err));
    }
    else{
        err = new Error("Dish "+req.params.dishId+" Not Found");
        err.status=404;
        return next(err);
    }
    
},(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on /dishes/"+
    req.params.dishId+'/comments');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
Dishes.findById(req.params.dishId)
    .then((dish)=>{
    if(dish!=null)
    {
        for(let i=(dish.comments.length-1);i>=0;--i){
            dish.comments.id(dish.comments[i]._id).remove();
        }
        dish.save()
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);                
        }, (err) => next(err));
    }
    else{
        err = new Error("Dish "+req.params.dishId+" Not Found");
        err.status=404;
        return next(err);
    }
    },(err)=>next(err))
    .catch((err)=>next(err));
});

dishRouter.route('/:dishId/comments/:commentId')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.cors,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    // populate the author field in comment schema inside dish schema
    .populate('comments.author')
    .then((dish)=>{
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments.id(req.params.commentId));
    }
    else if(dish==null){
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.status = 404;
        return next(err);
    }
    else{
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.status = 404;
        return next(err);  
    }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res,next) => {
Dishes.findById(req.params.dishId)
.then((dish)=>{
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
        if(String(dish.comments.id(req.params.commentId).author._id)===String(req.user._id)){
            if(req.body.rating){
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if(req.body.comment){
            dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save()
            .then((dish)=>{
            Dishes.findById(dish._id)
            .populate('comments.author')
            .then((dish)=>{
                res.statusCode=200;
                res.setHeader('Content-type','application/json');
                res.json(dish);
            });
            },(err)=>next(err));
        }
        else{
            err = new Error('You are not authorized to modify someone elses comment!');
            err.status = 403;
            return next(err);            
        }
    }
    else if(dish==null){
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.status = 404;
        return next(err);
    }
    else{
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.status = 404;
        return next(err);  
    }
},(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res,next) => {
Dishes.findById(req.params.dishId)
.then((dish)=>{
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
        // console.log(dish.comments.id(req.params.commentId).author._id,"\n");
        // console.log(req.user._id)
        // console.log(String(dish.comments.id(req.params.commentId).author._id)===String(req.user._id))
        // req.body.author = req.user._id
        if(String(dish.comments.id(req.params.commentId).author._id)===String(req.user._id)){
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish)=>{
                // console.log("asdsadasdsadsadasdasdaddasdasdasds",dish);
            Dishes.findById(dish._id)
            .populate('comments.author')
            .then((dish)=>{
                res.statusCode=200;
                res.setHeader('Content-type','application/json');
                res.json(dish);
                });
            },(err)=>next(err));
        }
        else{
            err = new Error('You are not authorized to delete someone elses comment!');
            err.status = 403;
            return next(err);              
        }
    }
    else if(dish==null){
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.status = 404;
        return next(err);
    }
    else{
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.status = 404;
        return next(err);  
    }
},(err)=>next(err))
    .catch((err)=>next(err));
});
module.exports = dishRouter;