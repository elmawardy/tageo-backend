require('./bootstrap')
const { Mongo } = require('../db/mongo');


class Bootstrapper
{
    static async prepareDB(){
        await Mongo.connect();
        console.log("removing Test user from DB")

        // TODO why we have to make a find statement before delete otherwise it hangs forever ??
        await Mongo.db.collection('users').findOne({email:"test@example.com"})
        await Mongo.db.collection('users').deleteOne({email:"test@example.com"})
        console.log("Deleting reset tokens")
        await Mongo.db.collection('reset_password_tokens').deleteMany({email:"test@example.com"})
        // await Mongo.disconnect();
    }
}


// Prepare.prepareDB();


module.exports = { Bootstrapper }