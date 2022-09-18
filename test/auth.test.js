var axios = require('axios');
var assert = require('assert');

describe('Auth', function () {
  describe('register', function () {
    it('should return Ok', function () {

      axios.post('http://127.0.0.1:3030/api/auth/register', {
        "email":"test@example.com",
        "password": "123",
        "name":"Test User"
      })
      .then(function (response) {
        assert.equal(response.status, 200);
      })
      .catch(function (error) {
        assert.equal(response.status, 200);
      });

    });
  });
});