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
const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key:  process.env.CLOUDINARY_API_KEY, 
  api_secret:  process.env.CLOUDINARY_API_SECRET 
});

//middleware
app.use(cors({
  origin: 'https://social-media-client-puce.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}));
app.use(express.json({limit : "10mb"}));
app.use(morgan('tiny'))
app.use(cookieParser())
const PORT = process.env.PORT;

   //hello

app.use('/auth' , authRoute);
app.use('/posts' , postRoute)
app.use('/user' , userRouter)
app.get('/' ,(req ,res) =>{
    res.send("connect sucessfully");
})

dbconnect();

app.listen(PORT , ()=>{
    console.log(`The app is running on port : ${PORT}`)
})   