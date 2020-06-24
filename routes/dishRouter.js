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
        console.log("Dishes Deleted!");
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

//   Handling the Schema inside a schema, schemaception

  dishRouter.route('/:dishId/comments')
  // if get verb was called at the dishes endpoint
  // then takes two params one to be executed on success and
  // one on failure
  .get((req,res,next)=>{
      Dishes.findById(req.params.dishId)
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
  .post((req,res,next)=>{
      // the data to be POSTED is in the body of the request
      Dishes.findById(req.params.dishId)
      // if the dish is successfully added perform this
      .then((dish)=>{
        if(dish!=null)
        {
          dish.comments.push(req.body);
          dish.save()
        //   if dish comment is saved successfully then
          .then((dish)=>{
              res.statusCode=200;
              res.setHeader('Content-type','application/json');
              res.json(dish.comments);
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
  .put((req,res,next)=>{
      res.statusCode=403;
      res.end("Put operation not supported on /dishes/"+
        req.params.dishId+'/comments');
  })
  .delete((req,res,next)=>{
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
  .get((req,res,next)=>{
      Dishes.findById(req.params.dishId)
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
  .post((req, res,next) => {
      res.statusCode = 403;
      res.end('POST operation not supported on /dishes/'+ req.params.dishId);
  })
  .put((req, res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
      if (dish != null && dish.comments.id(req.params.commentId) != null) {
          if(req.body.rating){
              dish.comments.id(req.params.commentId).rating = req.body.rating;
          }
          if(req.body.comment){
            dish.comments.id(req.params.commentId).comment = req.body.comment;
          }
          dish.save()
          .then((dish)=>{
            res.statusCode=200;
            res.setHeader('Content-type','application/json');
            res.json(dish.comments);
          })
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
  .delete((req, res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
      if (dish != null && dish.comments.id(req.params.commentId) != null) {
          dish.comment.id(req.params.commentId).remove();
          dish.save()
          .then((dish)=>{
            res.statusCode=200;
            res.setHeader('Content-type','application/json');
            res.json(dish);
          })
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