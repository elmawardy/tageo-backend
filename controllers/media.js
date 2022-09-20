var express = require('express')
var multer  = require('multer')
const { Mongo } = require('../db/mongo');
const mediaRouter = express.Router();
var jwt = require('express-jwt');
mongodb = require('mongodb')
var path = require('path')
var crypto = require('crypto');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/uploads')
    },
    filename: function (req, file, cb) {
        var filename = crypto.randomBytes(15).toString('hex');
        cb(null, filename + path.extname(file.originalname)) //Appending extension
    }
})
  

var upload = multer({ storage: storage });


mediaRouter.route('/upload/photo').post(
jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
upload.single('photo')
,async function(req,res){
    res.sendStatus(200)
    await Mongo.db.collection('posts').updateOne({_id: new mongodb.ObjectId(req.body.post_id)},{
        $push:{
            media: {url:'/data/uploads/'+req.file.filename,type:'image',upload_date:new Date(),comment:req.body.comment}
        }})
})


mediaRouter.route('/upload/video').post(
jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
upload.single('photo')
,async function(req,res){
    res.sendStatus(200)
    await Mongo.db.collection('posts').updateOne({_id: new mongodb.ObjectId(req.body.post_id)},{
        $push:{
            media: {path:'/data/uploads/'+req.file.filename,type:'video',upload_date:new Date(),comment:req.body.comment}
        }})
})
    


module.exports = mediaRouter;








