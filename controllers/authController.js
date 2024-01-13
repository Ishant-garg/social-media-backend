const User = require('../models/user')
const jwt = require('jsonwebtoken')

const bcrypt = require('bcrypt')
const { error, success } = require('../utils/responseWrapper')
const signupController = async (req, res)=>{
    try{
        const {email , password ,name} = req.body

        if(!email || !password){
            return res.send(error(400 , 'All fields are required'))
            
        }

        //if user already exists with same email
        const oldUser = await User.findOne({email});

        if(oldUser){
            return res.send(error(409 , 'user already exists with same email'))   
        }

        const hashedPassword = await bcrypt.hash(password ,10);

        const newUser = await User.create({  
            email,
            password : hashedPassword,
            name
        })
        
        console.log(newUser)
        return res.send(success(200 , {newUser}))

 
    }
    catch (e){
        console.log(error)
        return res.send(error(500, e.message));

    }
}
const loginController = async (req, res)=>{
    try{
        const {email , password} = req.body

        if(!email || !password){
            return res.send(error(400 , 'All fields are required'))
        }
//check if the user exist in db of the same email
         const user = await User.findOne({email});
         //if no user exisrt
         if(!user){
            return res.send(error(400 , `No user exists with this mail \n  Please signup`))
         }

         const matched = await bcrypt.compare(password , user.password);
         if(!matched){
            return res.send(error(400 , 'incorrect password'))
         }

         
         const AccessToken =  generateAccessToken({
            _id : user._id 
         })
                 
         const RefreshToken =  generateRefreshToken({
            _id : user._id 
         })
        //sending cookie
         res.cookie('jwt' , RefreshToken ,{
            httpOnly : true,
            secure : true
         })
        return res.send(success(200 , {AccessToken}))

   
    }
    catch (e){   
        console.log(e)
        return res.send(error(500, e.message));

    }
}

//this api will check refresh token validity and generate new access token
const refreshTokenController = async (req, res) => {
    if (!(req.cookies.jwt)) {
        return res.send(error(401, 'Refresh token cookie is required'));
    }

    const RefreshToken = req.cookies.jwt;

    try {
        const verify = jwt.verify(RefreshToken, process.env.REFRESH_TOKEN_KEY);
        const _id = verify._id;
        const AccessToken = generateAccessToken({ _id });
        return res.send(success(201, { AccessToken }));
    } catch (e) {
        console.log(e);
        return res.send(error(401, 'Invalid refresh token is entered'));
    }
}


const generateAccessToken = (data) =>{
    const token = jwt.sign(data , process.env.ACCESS_TOKEN_KEY,{
        expiresIn : '1y'
    });
    console.log(token)
    return token
}
const generateRefreshToken = (data) =>{
    const token = jwt.sign(data , process.env.REFRESH_TOKEN_KEY,{
        expiresIn : '3y'
    });
    console.log(token)
    return token
}
const logoutController = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        })
        return res.send(success(200, 'user logged out'))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

module.exports = {
    signupController,
    loginController,
    refreshTokenController,
    logoutController
}

