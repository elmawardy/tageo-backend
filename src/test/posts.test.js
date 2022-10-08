let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();
const { Mongo } = require('../db/mongo');


chai.use(chaiHttp);


describe('Posts', () => {

    var jwt = null;
    var userInfo = null;

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
              jwt = res.body.Jwt
              userInfo = res.body.user
    
              done()
          })
    
    
        })
    })

    describe("Insert Post",()=>{

        describe("With article only",()=>{
            it("Should return expected result",(done)=>{


                chai.request(server)
                .post('/api/posts/add')
                .set('Authorization','Bearer '+jwt)
                .send(
                  {
                    "article":"Test body"
                  }
                )
                .end((err,res)=>{
                    res.should.have.status(200)
                    res.body.should.have.property('message').eql('success')
                    res.body.should.have.property('data').have.property('post_id')
    
                    done()
                })
    
    
            })
        })
    })

    describe('Delete Account',()=>{

        it('Should return OK',(done)=>{
            chai.request(server)
            .post('/api/auth/deleteaccount')
            .set('Authorization','Bearer '+jwt)
            .set('Content-Type','application/json')
            .send({
                "password": "123",
            })
            .end((err, res)=>{
                res.should.have.status(200)
                should.not.exist(err)
                done()
            })
        })
    
    })
})