const { Mongo } = require('../db/mongo');

class DatabaseHelpers
{
    static async ConfirmUserDirectlyFromDB(email: String) {
        await Mongo.db.collection('users').updateOne({email},{$set: {confirmed: true}});
    }
}

module.exports = {DatabaseHelpers}