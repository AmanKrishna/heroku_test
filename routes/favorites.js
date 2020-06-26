// handling the /dishes and /dishes/:id endpoint
// this file is a node module on its own
const express = require('express');
const bodyParser = require('body-parser');

// connecting with the db server!
const mongoose = require('mongoose');
const Dishes = require('../model/dishes');
const Favorites = require('../model/favorites');
const authenticate = require('../authenticate');

// calling cors
const cors = require("./cors");

// dishRuter is now an express router
const favRouter = express.Router();
favRouter.use(bodyParser.json());

favRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({"user":req.user._id})
    .populate("user")
    .populate("dishes.favDish")
    .then((favDishes)=>{
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(favDishes);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({"user":req.user._id})
    .then((fav)=>{
        const listOfFavDishes = req.body;
        console.log(listOfFavDishes)
        if(fav){
            for(let i=listOfFavDishes.length-1;i>=0;--i){
                const favDishSelect = fav.dishes.find((fav)=>{
                    console.log(fav.favDish+"\n"+listOfFavDishes[i]._id);
                    return String(fav.favDish)===String(listOfFavDishes[i]._id);
                });
                if(!favDishSelect)
                    fav.dishes.push({"favDish":listOfFavDishes[i]._id})
            }
            fav.save()
            .then((fav)=>{
                Favorites.findById(fav._id)
                .populate("user")
                .populate("dishes.favDish")
                .then((fav)=>{
                    res.statusCode=200;
                    res.setHeader('Content-type','application/json');
                    res.json(fav);
                },(err)=>next(err));
            },(err)=>next(err));
        }
        else{
            Favorites.create({
                user: req.user._id,
                dish : []
            })
            .then((fav)=>{
                Favorites.findById(fav._id)
                .then((fav)=>{
                    for(let i=listOfFavDishes.length-1;i>=0;--i){
                        console.log("Favourite DIsh: ",listOfFavDishes[i]._id);
                        fav.dishes.push({"favDish":listOfFavDishes[i]._id})
                    }
                    fav.save()
                    .then((fav)=>{
                        Favorites.findById(fav._id)
                        .populate("user")
                        .populate("dishes.favDish")
                        .then((fav)=>{
                            res.statusCode=200;
                            res.setHeader('Content-type','application/json');
                            res.json(fav);
                        },(err)=>next(err));
                    },(err)=>next(err));
                },(err)=>next(err))
            },(err)=>next(err))
        }
        
    },(err)=>next(err));
})


.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    console.log("AsdasdASD ",req.user._id);
    Favorites.findOne({user:req.user._id})
    .then((fav)=>{
        if(!fav){
            res.statusCode=403;
            res.setHeader('Content-type','application/json');
            res.json({"status":false,"message":"No Favorite Dishes!"});
            return;     
        }
        console.log(fav._id)
        Favorites.findByIdAndDelete(fav._id)
        .then((result)=>{
            res.statusCode=200;
            res.setHeader('Content-type','application/json');
            res.json({"status":true,"message":"Successfully deleted!"});
        },(err)=>next(err));
    },(err)=>next(err));
})

favRouter.route('/:favDishId')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            const favDishSelect = favorites.dishes.find((fav)=>{
                // console.log(fav.favDish+"\n"+req.params.favDishId);
                return String(fav.favDish)===String(req.params.favDishId);
            });
            if (!favDishSelect) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then((fav)=>{
        if(fav){
            // console.log("These arees\n\n",fav.dishes.id(req.params.favDishId));
            const favDishSelect = fav.dishes.find((fav)=>{
                // console.log(fav.favDish+"\n"+req.params.favDishId);
                return String(fav.favDish)===String(req.params.favDishId);
            });
            if(favDishSelect)
            {
                res.status = 401;
                res.setHeader('Content-Type','application/json');
                res.json({"Status":"Dish Already added to Favorites"});
                return;
            }
            else{
                fav.dishes.push({"favDish":req.params.favDishId})
                fav.save()
                .then((fav)=>{
                    Favorites.findById(fav._id)
                    // I have pushed the reference into the comment schema
                    // time to populate it
                    // .populate('user','dishes.dish')
                    .populate("user")
                    .populate("dishes.favDish")
                    .then((fav)=>{
                        // console.log("In the else part of the code!!!!!")
                        res.statusCode=200;
                        res.setHeader('Content-type','application/json');
                        res.json(fav);
                    },(err)=>next(err));
                },(err)=>next(err));
            }
        }
        else{
            Favorites.create({
                user: req.user._id,
                dish : []
            })
            .then((fav)=>{
                console.log("This is the newly createed Fav: ",fav)
                Favorites.findById(fav._id)
                // I have pushed the reference into the comment schema
                // time to populate it
                // .populate('user','dishes.dish')
                .then((fav)=>{
                    fav.dishes.push({"favDish":req.params.favDishId})
                    fav.save()
                    .then((fav)=>{
                        Favorites.findById(fav._id)
                        // I have pushed the reference into the comment schema
                        // time to populate it
                        // .populate('user','dishes.dish')
                        .populate("user")
                        .populate("dishes.favDish")
                        .then((fav)=>{
                            res.statusCode=200;
                            res.setHeader('Content-type','application/json');
                            res.json(fav);
                        },(err)=>next(err));
                    },(err)=>next(err));
                },(err)=>next(err));
            },(err)=>next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then((favDishes)=>{
        if(!favDishes){
            res.statusCode=403;
            res.setHeader('Content-type','application/json');
            res.json({"status":false,"message":"You do not have any favorites!!"});
            return;     
        }
        else{
            console.log("List of all dieshes\n\n",favDishes+"\n\nEnd");
            favDishSelect = favDishes.dishes.find((fav)=>{
                console.log(fav.favDish+"\n"+req.params.favDishId);
                return String(fav.favDish)===String(req.params.favDishId);
            });
            console.log(favDishSelect)
            if(favDishSelect){
                favDishes.dishes.id(favDishSelect).remove();
                favDishes.save()
                .then((fav)=>{
                    console.log("Inside!!!! ",fav);
                    Favorites.findById(fav._id)
                    .populate("user")
                    .populate("dishes.favDish")
                    .then((fav)=>{
                        res.status=200;
                        res.setHeader("Content-Type","application/json");
                        res.json(fav);
                    })
                },(err)=>next(err))
            }
            else{
                res.statusCode=403;
                res.setHeader('Content-type','application/json');
                res.json({"status":false,"message":"This Dish is not in favs"});
                return;   
            }
        }
        
    },(err)=>next(err));
});


module.exports = favRouter;
