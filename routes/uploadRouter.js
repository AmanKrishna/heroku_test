const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
// file upload middleware
const multer = require('multer');

// calling cors
const cors = require("./cors");

// settting up Multer
const storage = multer.diskStorage({
    // file = info about file
    // cb = callback function
    destination: (req,file,cb)=>{
        // 1st param is error
        // 2nd parameter is the destination folder for uploads
        cb(null,'public/images');
    },
    filename: (req,file,cb)=>{
        cb(null,file.originalname)
    }
});
// Filtering the type of filter I am willing to take
const imageFileFilter = (req,file,cb) =>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return cb(new Error("You can upload only image files"),false);
    }
    else{
        return cb(null,true);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter
});

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("GET operation not supported on dishes");
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,
    // imageFile = name of the form field which specifies that file
    // single = upload a single file
    upload.single('imageFile'),(req,res)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(req.file);
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("PUT operation not supported on dishes");
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("DELETE operation not supported on dishes");
})

module.exports = uploadRouter;