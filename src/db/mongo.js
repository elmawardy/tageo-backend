const {MongoClient,Server,Logger} = require('mongodb');

class Mongo {

    static async connect() {
        try {
            if (this.db) return this.db
                this.client.connect(this.url, this.options)

            this.db = this.client.db('tageo')
            console.log("connected to db")
        }catch(e){
            console.error(e)
        }
    }

    static async disconnect(){
        try {
            if (this.db)
                this.client.close();
                
            console.log("disconnected from db")
        }catch(e){
            console.error(e)
        }
    }

}

// Logger.setLevel("debug");
Mongo.db = null
Mongo.client = new MongoClient(new Server("127.0.0.1","27017"), {native_parser: true});
Mongo.options = {
    bufferMaxEntries:   0,
    useNewUrlParser:    true,
    useUnifiedTopology: true,
}

module.exports = { Mongo: Mongo }
