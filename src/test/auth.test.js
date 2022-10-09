var assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();
const { Mongo } = require('../db/mongo');

var {Bootstrapper} = require('./bootstrap');
const { StatusCodes } = require('http-status-codes');
const {DatabaseHelpers} = require('../helpers/DatabaseHelpers')


chai.use(chaiHttp);

describe('Auth', () => {

  var jwt = null;
  var userInfo = null


  describe('Register', () => {
    
    before(async ()=>{
        await Bootstrapper.prepareDB();
    })

    it('Should return Ok',(done) => {


      chai.request(server)
      .post('/api/auth/register')
      .send(
        {
          "email":"test@example.com",
          "password": "123",
          "name":"Test User"
        }
      )
      .end((err, res) => {
            // if (err) done(err);
            res.should.have.status(200);
            // res.body.should.be.a('array');
            // res.body.length.should.be.eql(0);
            done()
      })

    });


    it("Should return Unauthorized on unconfirmed signin",(done)=>{

      chai.request(server)
      .post('/api/auth/signin')
      .send(
        {
          "email":"test@example.com",
          "password": "123"
        }
      )
      .end((err,res)=>{
          res.should.have.status(401)
          done()
      })

    })

    it("Should be able to confirm user directly from db",()=>{
        return DatabaseHelpers.ConfirmUserDirectlyFromDB("test@example.com")
    })

  });


  describe('Signin',()=>{


    it('Should return 409',(done) => {


      chai.request(server)
      .post('/api/auth/register')
      .send(
        {
          "email":"test@example.com",
          "password": "123",
          "name":"Test User"
        }
      )
      .end((err, res) => {
            // if (err) done(err);
            res.should.have.status(StatusCodes.CONFLICT);
            // res.body.should.be.a('array');
            // res.body.length.should.be.eql(0);
            done()
      })

    });


    it('Should receive expected response',(done)=>{


      chai.request(server)
      .post('/api/auth/signin')
      .send(
        {
          "email":"test@example.com",
          "password": "123"
        }
      )
      .end((err,res)=>{
          res.should.have.status(200)
          res.body.should.have.property('Jwt')
          res.body.should.have.property('user').have.property('email').eql('test@example.com')
          res.body.should.have.property('user').have.property('name').eql('Test User')
          res.body.should.have.property('user').have.property('id') // TODO: make sure that the id complies to the mongo id format

          jwt = res.body.Jwt
          userInfo = res.body.user

          done()
      })


    })
    
  })

  describe('Password Management',()=>{

    var verificationCode = null

    describe('Send reset URL',()=>{
        it('Should return Ok',(done)=>{

            chai.request(server)
            .post('/api/auth/sendreseturl')
            .send({
              "email": "test@example.com"
            })
            .end((err, res)=>{
              res.should.have.status(200)
              done()
            })


        })

        it('Verification code exists in the db', async ()=>{
            console.log("get verification code from DB (Email client !ready yet)")
            var dbObject = await Mongo.db.collection('reset_password_tokens').findOne({email:"test@example.com"})
            verificationCode = dbObject.token
            should.exist(dbObject.token)
        })

    })



    describe('Reset password',()=>{
      
      it('Should return Ok',(done)=>{
  
          chai.request(server)
          .post('/api/auth/resetpassword')
          .send({
            "token": verificationCode,
            "password": "123456"
          })
          .end((err, res)=>{
            res.should.have.status(200)
            should.not.exist(err)
            console.log("Verification Code:"+verificationCode+" response:"+res)
            done()
          })
      
      })
  
    })


    describe('Change password',()=>{

      before('Getting Jwt',(done) => {
        
        console.log("signing in..")
        chai.request(server)
          .post('/api/auth/signin')
          .send({
            "email": "test@example.com",
            "password": "123456"
          })
          .end((err, res)=>{
            res.should.have.status(200)
            res.body.should.have.property('Jwt')
            should.not.exist(err)

            jwt = res.body.Jwt
            console.log("signed in")
            done();
          })


      });
      
      it('Should return Ok',(done)=>{
          console.log("changing password...")
          chai.request(server)
          .post('/api/auth/changepassword')
          .set('Authorization','Bearer '+jwt)
          .set('Content-Type','application/json')
          .send({
            "oldpassword": "123456",
            "newpassword": "123"
          })
          .end((err, res)=>{
            res.should.have.status(200)
            should.not.exist(err)
            done()
          })
      
      })


  
    })


    describe("Send reset URL",()=>{
        it('Should return Ok',(done)=>{
          
          chai.request(server)
          .post('/api/auth/sendreseturl')
          .send({
            "email": "test@example.com",
          })
          .end((err, res)=>{
            res.should.have.status(200)
            should.not.exist(err)
            done()
          })
      
      })
    })

    

  })


  describe("User info",()=>{
      
      describe('Get basic info',()=>{

        it('Should return expected result',(done)=>{
            chai.request(server)
            .post('/api/auth/getbasicinfo')
            .set('Authorization','Bearer '+jwt)
            .set('Content-Type','application/json')
            .end((err, res)=>{
              res.body.should.have.property('Name')
              res.body.should.have.property('Email')
              res.should.have.status(200)
              should.not.exist(err)

              userId = res.body.userId
              done()
            })
        
        })

    
      })


      describe('Change Info',()=>{

        it('Should return Ok',(done)=>{
            chai.request(server)
            .post('/api/auth/changeinfo')
            .set('Authorization','Bearer '+jwt)
            .set('Content-Type','application/json')
            .send({
              "id": userInfo.id,
              "name": "New Name"
            })
            .end((err, res)=>{
              res.should.have.status(200)
              should.not.exist(err)
              done()
            })
        
        })

        it("Should return Unauthorized",(done)=>{

          chai.request(server)
            .post('/api/auth/changeinfo')
            .set('Authorization','Bearer '+jwt)
            .set('Content-Type','application/json')
            .send({
              "id": "6271449d16f5de5a1c8f2998", // dump id
              "name": "New Name"
            })
            .end((err, res)=>{
              res.should.have.status(401)
              done()
            })

        })

        
        it("Should return 401",(done)=>{ 
          // Generally speaking this should return 400 since the input is empty but to make the backend code simplier we will just return 401 if both Unauthorized or empty request
          chai.request(server)
            .post('/api/auth/changeinfo')
            .set('Authorization','Bearer '+jwt)
            .set('Content-Type','application/json')
            .send({})
            .end((err, res)=>{
              res.should.have.status(401)
              done()
            })

        })


        it("Should return Bad request",(done)=>{ 
          // Generally speaking this should return 400 since the input is empty but to make the backend code simplier we will just return 401 if both Unauthorized or empty request
          chai.request(server)
            .post('/api/auth/changeinfo')
            .set('Authorization','Bearer '+jwt)
            .set('Content-Type','application/json')
            .send({
              "id": userInfo.id,
            })
            .end((err, res)=>{
              res.should.have.status(400)
              done()
            })

        })

    
      })


  })


});