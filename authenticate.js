var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require("./model/user");
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config');

// export function supported by passport-local
// passport-local-mongoose proveide the authenticate function
// without it I have to write my own authenticate function
exports.local=passport.use(new LocalStrategy(User.authenticate()));
// take care of whatever is needed for supporting session
// Serailize decides what info will be stored in the session
// deserialize helps retrieve the info from the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create the JWT token
exports.getToken = function(user){
    return jwt.sign(user,config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
// how to extract JWT token from the incoming req message
// if Jwt token is found in Authentication header then below
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// 2 parameters, one is option another is a verify function
// done is a callback which passes info to passport whcih then
// loads it onto the res 
// JwtStrategy provide a set of built in functions to make
// my life easier. It takes in the incoming payload from JWT(Header+Payload+Signature)
// extract user from the payload and calls the callback
// function
exports.jwtPassport = passport.use('verifyUser',new JwtStrategy(opts,
    (jwt_payload,done)=>{
        console.log("JWT Payload",jwt_payload);
        User.findOne({_id: jwt_payload._id},(err,user)=>{
            if(err){
                // an error occured
                return done(err,false);
            }
            else if(user){
                // return the found user
                return done(null,user);
            }
            else{
                // couldnt find the user
                // can also register user here
                return done(null,false);
            }
        })
    }));
// jwt means I will use the JwtStrategy i just specified above
// session=should sessions be created
exports.verifyUser = passport.authenticate('verifyUser',{session: false});

exports.jwtPassport = passport.use('verifyAdmin',new JwtStrategy(opts,
    (jwt_payload,done)=>{
        console.log("JWT Payload",jwt_payload);
        User.findOne({_id: jwt_payload._id},(err,user)=>{
            if(err){
                // an error occured
                var error = new Error("This is a forbidden action!")
                return done(error,false);
            }
            else if(user.admin){
                // return the found user
                return done(null,user);
            }
            else{
                // couldnt find the user
                // can also register user here
                return done(null,false);
            }
        })
    }));
// jwt means I will use the JwtStrategy i just specified above
// session=should sessions be created
exports.verifyAdmin = passport.authenticate('verifyAdmin',{session: false});

// Simpler way to implement verifyAdmin
// exports.verifyAdmin = (req,res,next)=>{
//     if(req.user.admin)
//         next();
//     else{
//         var err = new Error("You are not an Admin");
//         err.status = 403;
//         return next(err);
//     }
// }

// FacebookTokenStrategy takes 2 parameter
// first is the clientId and clientSecret and the other is
// a callback function which takes in accesstoken etc etc
exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
},(accessToken,refreshToken,profile,done)=>{
    // search if the facebookId is present in the db
    User.findOne({facebookId: profile.id},(err,user)=>{
        // error happened while seaching for user
        if(err){
            return done(err,false);
        }
        if(!err && user!==null){
            return done(null,user);
        }
        else{
            user = new User({username:profile.displayName});
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err,user)=>{
                if(err)
                    return done(err,false);
                else
                    return done(null,user);
            })
        }
    });
}));
