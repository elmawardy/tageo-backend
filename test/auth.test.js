var assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();
const { Mongo } = require('../db/mongo');


chai.use(chaiHttp);

describe('Auth', () => {
  describe('register', () => {
    it('should return Ok',(done) => {

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

    after(async function(){
        console.log("confirming user through DB (Email client !ready yet)")
        await Mongo.db.collection('users').updateOne({email:"test@example.com"},{$set: {confirmed: true}});
    })

  });


  describe('Signin',()=>{
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
          done()
      })


    })
  })

});