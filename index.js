const express = require('express')
const morgan = require('morgan')
const path = require('path');
const bodyParser = require('body-parser');
const authRouter = require('./controllers/auth');
const postsRouter = require('./controllers/posts');
const groupsRouter = require('./controllers/groups');
const mediaRouter = require('./controllers/media');
const { Mongo } = require('./db/mongo');
const cors = require('cors')
var { graphqlHTTP } = require('express-graphql');
const {schema,root} = require('./controllers/graphql')

const app = express()
const port = 3030

app.use(cors());
app.options('*', cors());
// logger middleware
app.use(morgan('[:date[clf]] :remote-addr - :method :url :status :res[content-length] - :response-time ms')) 
// parse body
app.use(bodyParser.json());
// serve static files from this directory
app.use(express.static(path.join(__dirname,'/www/')))
app.use('/data/uploads',express.static(path.join(__dirname,'/data/uploads')))

app.set('views','./src/views')
app.set('view engine','ejs')

// routes
app.use('/api/auth',authRouter)
app.use('/api/tags',postsRouter)
app.use('/api/posts',postsRouter)
app.use('/api/groups',groupsRouter)
app.use('/api/media',mediaRouter)
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));


Mongo.connect();
app.listen(port,'0.0.0.0',()=>{
    console.log(`Example app listening at http://0.0.0.0:${port}`)
})