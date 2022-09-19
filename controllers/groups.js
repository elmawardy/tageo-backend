const express = require('express');
const { Mongo } = require('../db/mongo');
const groupsRouter = express.Router();
const bcrypt = require('bcrypt');
var jwt = require('express-jwt');
var jwtoken = require('jsonwebtoken');
mongodb = require('mongodb')

groupsRouter.route('/create')
.post(
jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
async function (req,res){
    
    var group = await Mongo.db.collection('groups').findOne({name:req.body.name});

    if (!group){
        if (req.body.name.includes(" ")){
            res.statusCode = 400;
            res.send({error:"name can't contain spaces"})
            return
        }

        await Mongo.db.collection('groups').insertOne({name:req.body.name,description:req.body.description,admin:req.user.id});
        res.sendStatus(200);
    }else{
        res.statusCode = 400;
        res.send({error:"name already exists!"})
        return
    }

})

groupsRouter.route('/update').post(
jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
async function (req,res){
    var group = await Mongo.db.collection('groups').findOne({_id: new mongodb.ObjectId(req.body.id)})

    if (group){
        if (req.user.id == group.admin){

            var updated_object = {}

            if (req.body.name){
                if (group.name != req.body.name){
                    updated_object.name = req.body.name
                }
            }

            if (req.body.description){
                if (group.description != req.body.description){
                    updated_object.description = req.body.description
                }

            }
            
            if (Object.keys(updated_object).length > 0){
                await Mongo.db.collection('groups').updateOne({_id: new mongodb.ObjectId(req.body.id)},{$set: updated_object})
            }
            res.sendStatus(200);
            return

        }else{
            res.sendStatus(401);
            return
        }   
    }else{
        res.sendStatus(404);
        return
    }


})


groupsRouter.route('/join').post(
jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
async function (req,res){
    await Mongo.db.collection('group_members').insertOne({group_id: new mongodb.ObjectId(req.body.group_id),user_id: new mongodb.ObjectId(req.user.id)})
    res.sendStatus(200)
    return
}
)

groupsRouter.route('/leave').post(
jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
async function (req,res){
    await Mongo.db.collection('group_members').remove({group_id: new mongodb.ObjectId(req.body.group_id),user_id: new mongodb.ObjectId(req.user.id)})
    res.sendStatus(200)
    return
}
)

groupsRouter.route('/usergroups').get(
    jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
    async function (req,res){
        // var group_list = await Mongo.db.collection('group_members').find({user_id:new mongodb.ObjectId(req.user.id),group_id:new mongodb.ObjectId(req.query.group_id)})
        // .project(
        //     {
        //         group_id:1,
        //         group_name: await Mongo.db.collection('groups').find({_id: new mongodb.ObjectId(req.query.group_id)})
        //     }
        // )
        // .toArray()


        var group_list = await Mongo.db.collection('group_members').aggregate([
            {$match:{user_id: new mongodb.ObjectId(req.user.id)}},
            {$lookup:{from:"groups",localField:"group_id",foreignField:"_id","as":"group"}},
            {$project:{"group.name":1,"_id":0,"group._id":1}}
        ]).toArray()

        res.send({group_list:group_list[0].group})
        return
    }
)

groupsRouter.route('/customfieldtypes').get(
    jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
    async function(req,res){
    var group_field_types = await Mongo.db.collection('posts').aggregate([
            {$match:{groups:{$in :[new mongodb.ObjectId(req.query.groupid)]}}},
            {$project:
                {
                    _id:1,
                    custom_field_types:{
                        $cond : {
                            if :{ $isArray:"$custom_fields"}, then :"$custom_fields.type", 
                            else: [] } 
                    }
                }
            },
            {$unwind:"$custom_field_types"},
            {$group:{_id:null,fields:{$addToSet:"$custom_field_types"}}},
            {$project: {custom_field_types:"$fields",_id:0}}
    ]).toArray();
    res.send({field_types:group_field_types[0].custom_field_types})
    return
})


module.exports = groupsRouter;