const express = require('express')
const morgan = require('morgan')
const path = require('path');
const bodyParser = require('body-parser');
const authRouter = require('./controllers/auth');
const { Mongo } = require('./db/mongo');
const cors = require('cors')


const app = express()
const port = 3000

app.use(cors());
app.options('*', cors());
// logger middleware
app.use(morgan('[:date[clf]] :remote-addr - :method :url :status :res[content-length] - :response-time ms')) 
// parse body
app.use(bodyParser.json());
// serve static files from this directory
app.use(express.static(path.join(__dirname,'/www/')))

app.set('views','./src/views')
app.set('view engine','ejs')

// routes
app.use('/api/auth',authRouter)


Mongo.connect();
app.listen(3000,()=>{
    console.log(`Example app listening at http://0.0.0.0:${port}`)
})