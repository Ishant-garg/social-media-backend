 const post = require("../models/post");
const User = require("../models/user");
const { mapPostOutput } = require("../utils/Utils");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2
 

const postController = async (req , res) =>{
    console.log('inside post controller '+ req._id)
    return res.send(success(200, "These are all the posts"));}

const createPostController = async (req , res) =>{

    try{
        const {caption , img} = req.body;
        if(!caption || !img){
            return res.send(error(404 , 'image or caption is not provided '))
        }
        const owner = req._id
        const user = await User.findById(owner);

        
        const cloudImg = await cloudinary.uploader.upload(img ,{
                folder : 'postImg'
        })

        
        const Userpost = await post.create(
            {
                owner,
                caption,
                image : {
                    url : cloudImg.secure_url,
                    publicId : cloudImg.public_id
                }
            }
        )
        
        user.posts.push(Userpost._id)
        await user.save()
        
        res.send(success(201 , Userpost))
    }
    catch(e){
        res.send(error(409 , e.message))
    }

}

const likeAndUnlikePostController = async (req ,res)=>{
    const {postId} = req.body;
    const currUserId = req._id
    const UserPost = await post.findById(postId).populate('owner');
    try{

        if(!UserPost) {
            return res.send(error(500 , 'post is not found'))
        }
        if(UserPost.likes.includes(currUserId)){
            const index =  UserPost.likes.indexOf(currUserId);
                          
            UserPost.likes.splice(index ,1);
         }
        else{
            UserPost.likes.push(currUserId);
 
        }
        await UserPost.save();
        return res.send(success(200 , {UserPost : mapPostOutput(UserPost , currUserId)}))

    }
    catch(e){
        return res.send(error(500 , e.message))
    }
}

const followController = async (req ,res)=>{
    const {userIdTofollow} = req.body;
    const currUserId = req._id;
    
    const userTofollow = await User.findById(userIdTofollow)
    const currUser = await User.findById(currUserId)
    try{
        if(!userIdTofollow){
            return res.send(error(500 , 'user not exist with this id'))
        }

        //already follow so we unfollow
        if(currUser.following.includes(userIdTofollow)){
            const followingIndex = await currUser.following.indexOf(userIdTofollow)
            currUser.following.splice(followingIndex , 1);

            const followerIndex = await userTofollow?.followers?.indexOf(currUserId)
            userTofollow.followers.splice(followerIndex ,1);
 
        }
        else{
            currUser.following.push(userIdTofollow);
            userTofollow.followers.push(currUserId);
        }
        
        await currUser.save()
        await userTofollow.save();
        return res.send(success(200 , {user : userTofollow}))
        
    }
    catch(e){
        return res.send(error(500 , e.message))
    }
}
const feedDataController = async (req,res) => {

    try{
        const userId = req._id; 
        const currUser = await User.findById(userId).populate('following')
 
        const fullpost = await post.find({
            'owner' : {
                '$in' : currUser.following
            }
         }).populate('owner')
        
         const followingsId = currUser?.following?.map(item => item._id )
         console.log(  followingsId)
         const suggestions  = await User.find({
            '_id':{
                $nin: [...followingsId, userId]
            }
         }) 
         const posts = fullpost.map(item => mapPostOutput(item, req._id)).reverse();
     
        res.send(success(200 ,  {...currUser._doc , suggestions , posts}))
    }
    catch(e){
        return res.send(error(500 , e.message))

    }
}

const updatePostController  = async(req ,res) =>{
    try{
        const {postId , caption} = req.body;
        const userId = req._id
        const userPost = await post.findById(postId);
    
        if(!userPost){
            return res.send(error(500 , 'no post exist with this id'));
        }
    
        if(userPost.owner.toString() !== userId){
            return res.send(error(403 ,'this post not belongs to this user'))
        } 
        if(caption){
            userPost.caption = caption;
        }
    
        userPost.save();
        return res.send(success(200 , 'post updates success'))
    }
    catch(e){
        return res.send(error(500, e.message))
    }
}

const deleteUserController = async (req, res) => {
    try {
        const curuserId = req._id;
        const curUser = await User.findById(curuserId);

        // Delete all the posts created by the user
        await post.deleteMany({ owner: curuserId });

        // Delete user from followings of followers
        const followerPromises = curUser.followers.map(async (followerId) => {
            const followerUser = await User.findById(followerId);
            const index = followerUser?.following.indexOf(curuserId);
            if (index !== -1) {
                followerUser.following.splice(index, 1);
                await followerUser.save();
            }
        });

        const followingPromises = curUser.following.map(async (followingId) => {
            const followingUser = await User.findById(followingId);
            const index = followingUser?.followers.indexOf(curuserId);
            if (index !== -1) {
                followingUser.followers.splice(index, 1);
                await followingUser.save();
            }
        });

        // Deleting all the likes done by this user
        const allPosts = await post.find();
        const likePromises = allPosts.map(async (posts) => {
            const index = posts.likes.indexOf(curuserId);
            if (index !== -1) {
                posts.likes.splice(index, 1);
                await posts.save();
            }
        });

        // Wait for all promises to complete
        await Promise.all([...followerPromises, ...followingPromises, ...likePromises]);

        // Delete the user
        await User.findOneAndDelete({ _id: curuserId });

        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).send('User deleted successfully');
    } catch (e) {
        console.error('Error deleting user:', e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deletePostController = async(req ,res) =>{
    try{
        const {postId} = req.body;
        const userId = req._id

        const currUser = await User.findById(userId);
        const currPost = await post.findById(postId)

        if(!currPost){
            return res.send(error(500 , 'post not exist with this id'))
        }

        if(currPost.owner.toString() !==  userId){
            return res.send(error(500 , 'This post not belongs to this user'))
        }
 
        const index = currUser.posts.indexOf(postId);
        currUser.posts.splice(index ,1);

        await currUser.save();
    // Remove the post from the 'posts' collection
await post.findByIdAndDelete(postId);

        return res.send(success(200 , 'post deleted successfully'))

    }    
    catch(e){
        return res.send(error(500, e.message))

    }
}

const getMyPostController = async (req ,res) =>{
    try{
        const userId = req._id; 
        // const currUser = await User.findById(userId)

        const Posts = await post.find({
             owner : userId
         })  
                                                                        
        res.send(success(200 , Posts))
    }
    catch(e){
        return res.send(error(500 , e.message))

    }


}
const getUserPostController = async (req ,res) =>{
    try{

        const {userId} = req.body;

        if(!userId) {
            return res.send(error (400 , 'userId is required'))
        }
        const Posts = await post.find({
             owner : userId
        })  

        res.send(success(200 , Posts))

    }
    catch(e){
        return res.send(error(500 , e.message))
    }

}
const getMyProfile = async(req ,res) =>{
    try{
        const userId = req._id;

        const user = await User.findById(userId);
        return res.send(success(200 , {user}))
    }
    catch(e){
        return res.send(error(500 , e.message))

    }
    

}

const updateUserProfile = async(req ,res ) =>{
    try{
        const {name , bio , img} = req.body;
        const user =  await User.findById(req._id)
        if(name){
            user.name = name;
        }

        if(bio){
            user.bio = bio;
        }
        if(img){
            const cloudImg = await cloudinary.uploader.upload(img ,{
                folder : 'profileImg'
            })

            user.avatar = {
                url : cloudImg.secure_url,
                publicId : cloudImg.public_id
                
            }

        }
        await user.save();
        res.send(success(200 , {user}))
        
    }
    catch(e){
        res.send(error(500 , e.message))
    }
}

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId).populate({
            path: 'posts',
            populate: {
                path: 'owner'
            }
        });

        const fullpost = user.posts;
        const posts = fullpost.map(item => mapPostOutput(item, req._id)).reverse();

        return res.send(success(200, { ...user._doc, posts }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const generatePostController = async (req, res) => {
    const {description} = req.body
    if(!description){
        return res.send(error(400 , 'description is required'))
    }
    try{
        const resp = await fetch(
            `https://api.limewire.com/api/image/generation`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Version': 'v1',
                Accept: 'application/json',
                Authorization: 'Bearer lmwr_sk_thwlmoaYV3_2SOYc877IBvoORs29MMRNuYQvpOxYjY8DpJgK'
              },
              body: JSON.stringify({
                prompt: description,
                aspect_ratio: '1:1',
              })
            }
          );
        
          const data = await resp.json();
          if (!data.data || data.data.length === 0) {
            return res.status(400).json({ detail: 'No image data returned from API', status: 400 });
        }
          console.log(data);
          return res.send(success(200 ,  data.data[0].asset_url));
    
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {
    postController,
    createPostController,
    likeAndUnlikePostController,
    followController,
    feedDataController,
    updatePostController,
    deleteUserController,
    deletePostController,
    getMyPostController,
    getUserPostController,
    getMyProfile,
    generatePostController,
    updateUserProfile,
    getUserProfile
}
