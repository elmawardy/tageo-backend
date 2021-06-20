const express = require('express');
const { Mongo } = require('../db/mongo');
const tagRouter = express.Router();
var jwt = require('express-jwt');
mongodb = require('mongodb')


tagRouter.route('/add')
.post(jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },)
    ,async function(req,res){
    
    Mongo.db.collection('tags').insert({title:req.body.title,coordinates: req.body.coordinates,comment: req.body.comment,hashtag: req.body.hashtag,userid:req.user.id})
    res.send("Success")
    return
})

tagRouter.route('/getnearby')
.get(async function(req,res){
    console.log(parseFloat (req.query.Longitude)+ " " +parseFloat (req.query.Latitude) +" "+ parseFloat (req.body.RangeInMeters))
    var tags = await Mongo.db.collection('tags').find({hashtag:{$eq:req.query.Hashtag},"coordinates" : {$near : { $geometry : {type: "Point", coordinates: [parseFloat (req.query.Longitude),parseFloat (req.query.Latitude)] },$maxDistance: parseFloat (req.query.RangeInMeters) } } }).toArray()
    res.send({tags})
    return
})

tagRouter.route('/search')
.get(async function(req,res){
    var hashtags = await Mongo.db.collection('tags').distinct("hashtag",{ "hashtag" : new RegExp(`^${req.body.SearchText}`,'i') })
    console.log(hashtags)
    res.send({hashtags})
    return
})

tagRouter.route('/getusertags')
.post(
    jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
    async function(req,res){
        var tags = await Mongo.db.collection('tags').find({userid: req.user.id}).toArray()
        res.send(tags)
        return
})

tagRouter.route('/delete')
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

module.exports = tagRouter;