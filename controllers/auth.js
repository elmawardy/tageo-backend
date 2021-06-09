const express = require('express');
const passport = require('passport') , LocalStrategy = require('passport-local').Strategy;
const { Mongo } = require('../db/connect');
const authRouter = express.Router();
const bcrypt = require('bcrypt');


authRouter.route('/signin')
.post(async function (req,res){
    let user = await Mongo.db.collection('users').findOne({ email:req.body.email });
    if (user){
        var valid = await validPassword(user.password,req.body.password);
        if (valid){
            res.send("success")
        }
    }
    
    res.statusCode = 401;
    res.send("error")
})

authRouter.route('/register').post(async function(req, res, next) {
    // Whatever verifications and checks you need to perform here
    var hash = await hashPassword(req.body.password)
    Mongo.db.collection('users').insertOne({email:req.body.email,password:hash});
    res.send("done")
  });


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