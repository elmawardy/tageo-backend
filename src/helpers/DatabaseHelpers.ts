const { Mongo } = require('../db/mongo');

class DatabaseHelpers
{
    static async ConfirmUserDirectlyFromDB(email: String) {
        await Mongo.db.collection('users').updateOne({email},{$set: {confirmed: true}});
    }

    static async getVerificationCodeByEmail(email: String) {
        var dbObject = await Mongo.db.collection('reset_password_tokens').findOne({email})
        if (dbObject.token)
            return dbObject.token
        else 
            return null
    }
}

module.exports = {DatabaseHelpers}