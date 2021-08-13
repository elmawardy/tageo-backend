const {MongoClient} = require('mongodb');

class Mongo {

    static async connect() {
        try {       
            if (this.db) return this.db
            var client = await MongoClient.connect(this.url, this.options)
            this.db = client.db('tageo')
            console.log("connected to db")
        }catch(e){
            console.error(e)
        }
    }

}

Mongo.db = null
Mongo.url = 'mongodb://localhost:27017'
Mongo.options = {
    bufferMaxEntries:   0,
    useNewUrlParser:    true,
    useUnifiedTopology: true,
}

module.exports = { Mongo: Mongo }
