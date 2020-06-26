// handling the /promotions and /promotions/:id endpoint
// this file is a node module on its own
const express = require('express');
const bodyParser = require('body-parser');
const Promotions = require('../model/promotions');
const authenticate = require('../authenticate');

// calling cors
const cors = require("./cors");

// promotionRuter is now an express router
const promoRouter = express.Router();
promoRouter.use(bodyParser.json());
// this router will  be mounted on the index.js
// all the verbs will act at this endpoint '/' in this case
// I will chain all the verbs
// i only say slash becuase tthis router is mounted at /promotions
promoRouter.route('/')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.cors,(req,res,next)=>{
    Promotions.find(req.query)
    .then((promos)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(promos);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Promotions.create(req.body)
    .then((promos)=>{
        console.log("New Promo has been created!");
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(promos);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on promotions");
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Promotions.remove({})
    .then((result)=>{
        console.log("Promotions have been deleted");
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(result);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

promoRouter.route('/:promoId')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.cors,(req,res,next)=>{
    Promotions.findById(req.params.promoId)
    .then((promo)=>{
        if(promo!=null)
        {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(promo);
        }
        else{
            err = new Error("This Promo "+(req.params.promoId)+" is not present in the database")
            err.status=404;
            return (next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'+ req.params.promoId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    Promotions.findById(req.params.promoId)
    .then((promo)=>{
        if(promo!=null)
        {
            Promotions.findByIdAndUpdate(req.params.promoId,{
                $set: req.body
            },{new:true})
            .then((promo)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(promo);
            },(err)=>next(err))
        }
        else{
            err = new Error("This Promo "+(req.params.promoId)+" is not present in the database")
            err.status=404;
            return (next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((resp)=>{
      console.log("Promo Deleted!");
      res.statusCode=200;
      res.setHeader('Content-type','application/json');
      res.json(resp);
  },(err)=>next(err))
  .catch((err)=>next(err));
});

module.exports = promoRouter;