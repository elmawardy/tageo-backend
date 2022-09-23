var express = require('express')
var multer  = require('multer')
const { Mongo } = require('../db/mongo');
const mediaRouter = express.Router();
var jwt = require('express-jwt');
mongodb = require('mongodb')
var path = require('path')
var crypto = require('crypto');
let sanitize = require('mongo-sanitize');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs');


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


mediaRouter.route('/changeprofilepicture').post(
    jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
    upload.single('photo'),
    async function(req,res){
      var request_data = sanitize(req.body);
      console.log(request_data)
      if (request_data.user_id == req.user.id){
        var user = await Mongo.db.collection('users').findOne({_id: new mongodb.ObjectId(req.user.id)})


        if (user.avatar) {
            fs.unlink(`./${user.avatar}`, (err => {
                if (err) console.log(err);
                else {
                    console.log("\nDeleted file "+user.avatar);
                }
            }));
        }


        await Mongo.db.collection('users').updateOne({_id: new mongodb.ObjectId(req.user.id)}
        ,{
            $set:{
                avatar: "/data/uploads/"+req.file.filename
            }
        })
        res.sendStatus(200)
        return
      }
  
      res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
  )

  mediaRouter.route('/changeuserbackeground').post(
    jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
    upload.single('photo'),
    async function(req,res){
      var request_data = sanitize(req.body);
      console.log(request_data)
      if (request_data.user_id == req.user.id){
        var user = await Mongo.db.collection('users').findOne({_id: new mongodb.ObjectId(req.user.id)})

        
        if (user.background){
            fs.unlink(`./${user.background}`, (err => {
                if (err) console.log(err);
                else {
                    console.log("\nDeleted file "+user.background);
                }
            }));
        }

        await Mongo.db.collection('users').updateOne({_id: new mongodb.ObjectId(req.user.id)}
        ,{
            $set:{
                background: "/data/uploads/"+req.file.filename
            }
        })
        res.sendStatus(200)
        return
      }
  
      res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
  )


mediaRouter.route('/upload/photo').post(
jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
upload.single('photo')
,async function(req,res){
    await Mongo.db.collection('posts').updateOne({_id: new mongodb.ObjectId(req.body.post_id)},{
        $push:{
            media: {url:'/data/uploads/'+req.file.filename,type:'image',upload_date:new Date(),comment:req.body.comment}
        }})
    res.sendStatus(200)
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








