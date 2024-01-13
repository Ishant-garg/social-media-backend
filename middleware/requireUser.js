const jwt = require('jsonwebtoken');
const { error } = require('../utils/responseWrapper');
const user = require('../models/user');
module.exports = async (req, res, next) => {
  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.send(error(401, 'auth token is required'))
  

  }
    const AccessToken = req.headers.authorization.split(" ")[1];
    console.log(AccessToken)

    try{
        const verify = jwt.verify(AccessToken , process.env.ACCESS_TOKEN_KEY)
        req._id = verify._id;
        const curUser = await user.findById(req._id);
        if(!curUser){
          return res.send(error(404 ,'no user exist with this id'))
        }
        console.log('inside require user')
        next();
    }
    catch(e){
        console.log(e)
        return res.send(error(401, 'invalid access key '))

    };
 
};
