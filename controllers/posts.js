const express = require('express');
const { Mongo } = require('../db/mongo');
const postsRouter = express.Router();
var jwt = require('express-jwt');
mongodb = require('mongodb')
var L = require('leaflet');


postsRouter.route('/add')
.post(jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },)
    ,async function(req,res){
    
    var groupsObjects = null;
    if (req.body.groups)
    groupsObjects = req.body.groups.map((group) => {
        return new mongodb.ObjectId(group)
    })

    await Mongo.db.collection('posts').insertOne({title:req.body.title,coordinates: req.body.coordinates,description: req.body.description,labels: req.body.labels,user_id:req.user.id,votes:0,groups:groupsObjects,publish_date:new Date(),custom_fields:req.body.custom_fields})


    res.send("Success")
    return
})

// postsRouter.route('/getnearby')
// .get(async function(req,res){
//     console.log(parseFloat (req.query.Longitude)+ " " +parseFloat (req.query.Latitude) +" "+ parseFloat (req.body.RangeInMeters))
//     var tags = await Mongo.db.collection('tags').find({hashtag:{$eq:req.query.Hashtag},"coordinates" : {$near : { $geometry : {type: "Point", coordinates: [parseFloat (req.query.Longitude),parseFloat (req.query.Latitude)] },$maxDistance: parseFloat (req.query.RangeInMeters) } } }).toArray()
//     res.send({tags})
//     return
// })

postsRouter.route('/getusertags')
.post(
    jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
    async function(req,res){
        var tags = await Mongo.db.collection('tags').find({userid: req.user.id}).toArray()
        res.send(tags)
        return
})

postsRouter.route('/delete')
.post(
    jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
    async function(req,res){
        var tag = await Mongo.db.collection('tags').findOne({_id : new mongodb.ObjectId(req.body.tagId)})
        if (tag){
            if (tag.userid == req.user.id){
                await Mongo.db.collection('tags').deleteOne({_id: new mongodb.ObjectId(req.body.tagId)})
                res.send("Done")
                return
            }

            res.sendStatus(401)
            return
        }

        res.sendStatus(404)
        return
    }
)

postsRouter.route('/vote').post(
    jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
    async function(req,res){
        await Mongo.db.collection('posts').updateOne({_id: new mongodb.ObjectId(req.body.post_id)},{$push:{
            user_votes: {user_id:new mongodb.ObjectId(req.user.id),isvoteup:req.body.isvoteup}
        }})

        if (req.body.isvoteup)
        await Mongo.db.collection('posts').updateOne({_id: new mongodb.ObjectId(req.body.post_id)},{$inc:{votes: 1}})
        else
        await Mongo.db.collection('posts').updateOne({_id: new mongodb.ObjectId(req.body.post_id)},{$inc:{votes: -1}})

        res.sendStatus(200)
    }
)

postsRouter.route('/comment').post(
    jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
    async function(req,res){
        await Mongo.db.collection('posts').updateOne({_id: new mongodb.ObjectId(req.body.post_id)},{$push: {
            comments: {_id:new mongodb.ObjectId(), user_id: new mongodb.ObjectId(req.user.id),content: req.body.content,create_date: new Date(),updated_date:new Date()} 
        }})

        res.sendStatus(200)
    }
)

postsRouter.route('/editcomment').post(
    jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
    async function(req,res){
        //var comment = await Mongo.db.collection('posts').findOne({_id: new mongodb.ObjectId(req.body.post_id)},{comments:1})
        var comment = await Mongo.db.collection('posts').findOne({_id: new mongodb.ObjectId(req.body.post_id),"comments.user_id":new mongodb.ObjectId(req.user.id),"comments._id": new mongodb.ObjectId(req.body.comment_id)},{"comments.user_id.$":1,_id :0,"comments.content":1,"comments.updated_date":1,"comments.create_date":1})
        if (comment){
            await Mongo.db.collection('posts').updateOne({_id: new mongodb.ObjectId(req.body.post_id),"comments._id": new mongodb.ObjectId(req.body.comment_id)},{
                "$set":{"comments.$.content":req.body.updated_content}
            })
            res.sendStatus(200)
            return
        }else{
            res.sendStatus(404)
            return
        }
    }
)

postsRouter.route('/select').post(
    jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
    async function(req,res){

        var findObject = {}

        if (req.body.groups){
            findObject.groups = {$in:req.body.groups.map((group)=>{
                return new mongodb.ObjectId(group)
            })}
        }
        if (req.body.range_in_meters && req.body.latitude && req.body.longitude){
           findObject.coordinates = {$near : { $geometry : {type: "Point", coordinates: [parseFloat (req.body.longitude),parseFloat (req.body.latitude)] },$maxDistance: parseFloat (req.body.range_in_meters) } }
        }
        if (req.body.labels){
            findObject.labels = {$in:req.body.labels}
        }
        var skip = req.body.skip ? req.body.skip : 0;

        var posts = await Mongo.db.collection('posts')
        .find(findObject)
        .project({
            _id:1,
            title:1,
            coordinates:1,
            description:1,
            labels:1,
            user_id:1,
            votes:1,
            coordinates:1,
            publish_date:1,
            media:1,
            comments_count:{
                $cond:{ 
                    if:{$isArray:"$comments"},then: {$size:"$comments"},
                    else: 0 
                }
            }})
        .sort({publish_date:-1}).skip(skip).limit(10).toArray()
        res.send({posts})
        return
    }
)

module.exports = postsRouter;