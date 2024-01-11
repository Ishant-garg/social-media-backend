const dotenv = require("dotenv")
dotenv.config("./env")

const express = require("express");
const app = express();
const cors = require('cors')
const authRoute = require('./routes/auth');
const postRoute = require('./routes/postRouter')
const userRouter = require('./routes/userRouter')
const dbconnect = require("./dbconnect");
const cookieParser = require('cookie-parser')

const morgan = require("morgan");
//middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
app.use(express.json());
app.use(morgan('tiny'))
app.use(cookieParser())
const PORT = 4000;



app.use('/auth' , authRoute);
app.use('/posts' , postRoute)
app.use('/user' , userRouter)
app.get('/api' ,(req ,res) =>{
    res.send("connect sucessfully");
})

dbconnect();

app.listen(PORT , ()=>{
    console.log(`The app is running on port : ${PORT}`)
})   