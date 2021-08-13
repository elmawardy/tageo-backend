const express = require('express');
const { Mongo } = require('../db/mongo');
const groupsRouter = express.Router();
const bcrypt = require('bcrypt');
var jwt = require('express-jwt');
var jwtoken = require('jsonwebtoken');
mongodb = require('mongodb')

groupsRouter.route('/create')
.post(
jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
async function (req,res){
    
    var group = await Mongo.db.collection('groups').findOne({name:req.body.name});

    if (!group){
        if (req.body.name.includes(" ")){
            res.statusCode = 400;
            res.send({error:"name can't contain spaces"})
            return
        }

        await Mongo.db.collection('groups').insertOne({name:req.body.name,description:req.body.description,admin:req.user.id,members:[]});
        res.sendStatus(200);
    }else{
        res.statusCode = 400;
        res.send({error:"name already exists!"})
        return
    }

})

groupsRouter.route('/update').post(
jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
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


module.exports = groupsRouter;