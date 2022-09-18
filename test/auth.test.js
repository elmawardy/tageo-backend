var assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();


chai.use(chaiHttp);

describe('Auth', () => {
  describe('register', () => {
    it('should return Ok', (done) => {

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
        done();
      });

    });
  });
});