const mongoose = require("mongoose");
const mongourl = "mongodb+srv://ishant_social_media:F1bhLd72SKGfAo8B@cluster1.iqdvfw3.mongodb.net/?retryWrites=true&w=majority"

module.exports = ()=>{
    mongoose.connect(mongourl, {

        useNewUrlParser : true,
        useUnifiedTopology : true
    })
    .then(()=>{console.log("connection is successfull")})
    .catch((err)=>{console.log("error occures" + err )});    
}