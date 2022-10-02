const express = require('express');
const { Mongo } = require('../db/mongo');
const {Email} = require('../helpers/email');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
var jwt = require('express-jwt');
var jwtoken = require('jsonwebtoken');
var crypto = require('crypto');
var sanitize = require('mongo-sanitize');
const { StatusCodes } = require('http-status-codes');
mongodb = require('mongodb')

require('dotenv').config();


authRouter.route('/changeinfo').post(
  jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
  async function(req,res) {
      var request_data = sanitize(req.body);
      if (request_data.id == req.user.id){
          var changes = {}
          var changes_empty = true;
          if (request_data) {
            if (request_data.name){
              changes.name=request_data.name;
              changes_empty = false
            }

            if (!changes_empty) {
              await Mongo.db.collection('users').updateOne({
                _id: new mongodb.ObjectId(request_data.id),
              },{$set:changes})
            }
            
          }
          res.statusCode = 200;
          res.send()
          return
      }
      res.statusCode = StatusCodes.UNAUTHORIZED;
      res.send()
      return
  }
)


authRouter.route('/signin')
.post(async function (req,res){

    var email = sanitize(req.body.email);

    let user = await Mongo.db.collection('users').findOne({ email });
      if (user){
        if (user.confirmed){
            var valid = await validPassword(req.body.password,user.password);
            if (valid){
                delete user.password;
              
                var token = jwtoken.sign({email:user.email,name:user.name,id:user._id}, process.env.JWT_KEY, {algorithm : 'HS256'});
                res.send({user:{email:user.email,name:user.name,id:user._id},Jwt:token})
                return
            }
        }
        // if user not confirmed
        else{
            res.statusCode = 401;
            res.send({message:"User not confirmed"})
        }
      }
    
    res.statusCode = 401;
    res.send({message:"Invalid email/password"})
    return
})

authRouter.route('/register').post(async function(req, res, next) {
    
    var email = sanitize(req.body.email);

    let user = await Mongo.db.collection('users').findOne({ email });
    if (user){
      res.statusCode = 409
      res.send({message:"Email already exists"})
      return
    }

    var hash = await hashPassword(req.body.password)

    var code = crypto.randomBytes(3).toString('hex').toUpperCase();

    await Mongo.db.collection('users').insertOne({email:req.body.email,password:hash,name:req.body.name,confirmed:false,verification_code:code});

    await Email.sendMail("Tageo",req.body.email,"Tageo Verification","verifyemail.html",{code})

    res.sendStatus(200);
  });

authRouter.route('/confirmuser').post(async function(req, res){
   let user = await Mongo.db.collection('users').findOne({email:req.body.email,verification_code:req.body.code})
   if (user){
      await Mongo.db.collection('users').updateOne({email:req.body.email,verification_code:req.body.code},{$set:{confirmed:true}})
      res.sendStatus(200)
      await Mongo.db.collection('users').updateOne({email:req.body.email},{$unset:{verification_code:1}})
      return
   }

   res.sendStatus(401)
   return
})


// authRouter.route('/reset_token_availability').post(async function (req, res) {
//    let token = await Mongo.db.collection('reset_password_tokens').findOne({token:req.body.token})
//    if (token){
//       if (token.expire_at < new Date().getTime()) {
//         res.statusCode = 400
//         res.send("Expired token")
//         return
//       }

//       res.sendStatus(200)
//       return
//    }

//    res.sendstatus(401)
//    return
// })

authRouter.route('/resetpassword').post(async function(req, res){
   let token = await Mongo.db.collection('reset_password_tokens').findOne({token:req.body.token})
   if (token){
      if (token.expire_at >= new Date().getTime()){
        var hash = await hashPassword(req.body.password)
        await Mongo.db.collection('users').updateOne({email:token.email},{$set :{password:hash}})
        res.sendStatus(200)
        return
      }

      res.sendStatus(400)
      return
   }

   res.sendStatus(404)
   return
})

authRouter.route('/sendreseturl').post(async function(req, res){
  var token = crypto.randomBytes(10).toString('hex').toUpperCase();
  let user = await Mongo.db.collection('users').findOne({email:req.body.email});
  if (user){
    // expire token after 30 minutes and insert in the db
    await Mongo.db.collection('reset_password_tokens').insertOne({email:req.body.email,token,expire_at:new Date(new Date().getTime() + 30*60000)})
    await Email.sendMail("Tageo",req.body.email,"Reset Password","reset_password.html",{
      name: user.name,
      operating_system: req.headers['user-agent'] || "Unknown",
      browser_name: req.headers['user-agent'] || "Unknown",
      action_url: 'http://localhost:3030/resetpassword?token='+token,
      support_url: 'http://localhost:3030/support'
    })
  }
  
  res.sendStatus(200)
  return
})

authRouter.route('/getbasicinfo').post(
    jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
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
  jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
  async function(req,res){
    await Mongo.db.collection('users').updateOne({_id: new mongodb.ObjectId(req.user.id)},{$set: {name: req.body.name}})
    res.sendStatus(200)
    return
  }
)

authRouter.route('/changepassword')
.post(
  jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
  async function(req,res){
    var user = await Mongo.db.collection('users').findOne({_id : new mongodb.ObjectId(req.user.id)})
    if (user){
      var validpassword = await validPassword(req.body.oldpassword,user.password);
      if (validpassword){
        var newpassword = await hashPassword(req.body.newpassword)
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
  jwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] },),
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