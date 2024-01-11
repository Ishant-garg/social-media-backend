const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email : {
        type :String,
        required : true,
        
    },
    password : {
        type : String,
        required : true
    },
    name : {
        type : String,
   
    },
    avatar : {
        publicId : String,
        url : String
    },

    followers : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        }
    ],

    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        }
    ],

    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "post"
        }
    ]
} , {timestamps : true})

module.exports = mongoose.model("user" , userSchema);