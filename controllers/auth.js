const express = require('express');
const { Mongo } = require('../db/mongo');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
var jwt = require('express-jwt');
var jwtoken = require('jsonwebtoken');
mongodb = require('mongodb')

authRouter.route('/signin')
.post(async function (req,res){
    let user = await Mongo.db.collection('users').findOne({ email:req.body.email });
    if (user){
        var valid = await validPassword(req.body.password,user.password);
        if (valid){
            delete user.password;
          
            var token = jwtoken.sign({email:user.email,name:user.name,id:user._id}, 'shhhhhhared-secret', {algorithm : 'HS256'});
            res.send({user:{email:user.email,name:user.name},Jwt:token})
            return
        }
    }
    
    res.statusCode = 401;
    res.send("Invalid email/password")
})

authRouter.route('/register').post(async function(req, res, next) {
    
    let user = await Mongo.db.collection('users').findOne({ email:req.body.email });
    if (user){
      res.statusCode = 409
      res.send("Already exists")
      return
    }

    var hash = await hashPassword(req.body.password)
    Mongo.db.collection('users').insertOne({email:req.body.email,password:hash,name:req.body.name});
    res.send("done")
  });

authRouter.route('/getbasicinfo').post(
    jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
    async function(req,res,next){
      
      if (req.user){
        let user = await Mongo.db.collection('users').findOne({ _id: new mongodb.ObjectId(req.user.id) });
        if (user){
          res.send({Name:user.name,Email:user.email});
          next();
          return
        }
      }

      res.statusCode = 400
      res.send({message:"User doesn't exist"})
      next();
});

authRouter.route('/updatebasicinfo')
.post(
  jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
  async function(req,res){
    await Mongo.db.collection('users').updateOne({_id: new mongodb.ObjectId(req.user.id)},{$set: {name: req.body.name}})
    res.sendStatus(200)
    return
  }
)

authRouter.route('/changepassword')
.post(
  jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
  async function(req,res){
    var user = await Mongo.db.collection('users').findOne({_id : new mongodb.ObjectId(req.user.id)})
    if (user){
      var validpassword = await validPassword(req.body.CurrentPassword,user.password);
      if (validpassword){
        var newpassword = await hashPassword(req.body.Newpassword)
        await Mongo.db.collection('users').updateOne({_id: new mongodb.ObjectId(req.user.id)},{$set: {password: newpassword}})
        res.sendStatus(200)
        return
      }else{
        res.statusCode = 400;
        res.send("Invalid Password")
        return
      }
    }

    res.sendStatus(404)
    return
  }
)

authRouter.route('/deleteaccount')
.post(
  jwt({ secret: 'shhhhhhared-secret', algorithms: ['HS256'] },),
  async function(req,res){
    var user = await Mongo.db.collection('users').findOne({_id : new mongodb.ObjectId(req.user.id)})
    if (user){
      let correctPassword = await validPassword(req.body.password,user.password);
      if (correctPassword){
        await Mongo.db.collection('tags').deleteMany({userid: req.user.id})
        await Mongo.db.collection('users').deleteOne({_id : new mongodb.ObjectId(req.user.id)})
        res.sendStatus(200)
        return
      }

      res.sendStatus(401)
      return
    }
    else{
      res.sendStatus(404)
      return
    }
  }
)

  async function hashPassword (password) {

    const saltRounds = 3;
  
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) reject(err)
        resolve(hash)
      });
    })
  
    return hashedPassword
  }

async function validPassword(user_password,hash){
    const valid = await new Promise((resolve,reject)=>{
        bcrypt.compare(user_password, hash, function(err, result) {
            if (err) reject(err)
            resolve(result)
        });
    })

    return valid
}


module.exports = authRouter;