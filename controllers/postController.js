 const post = require("../models/post");
const User = require("../models/user");
const { success, error } = require("../utils/responseWrapper");

const postController = async (req , res) =>{
    console.log('inside post controller '+ req._id)
    return res.send(success(200, "These are all the posts"));}

const createPostController = async (req , res) =>{

    try{
        const {caption} = req.body;
    
        const owner = req._id
        const user = await User.findById(owner);

        const Userpost = await post.create(
            {
                owner,
                caption
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
    const UserPost = await post.findById(postId);
    try{

        if(!UserPost) {
            return res.send(error(500 , 'post is not found'))
        }
        if(UserPost.likes.includes(currUserId)){
            const index =  UserPost.likes.indexOf(currUserId);
                          
            UserPost.likes.splice(index ,1);
            await UserPost.save();
            return res.send(success(200 , 'post unliked'))
        }
        else{
            UserPost.likes.push(currUserId);
            await UserPost.save();
            return res.send(success(200 , 'post liked'))
        }
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
            return req.send(error(500 , 'user not exist with this id'))
        }

        //already follow so we unfollow
        if(currUser.following.includes(userIdTofollow)){
            const followingIndex = await currUser.following.indexOf(userIdTofollow)
            currUser.following.splice(followingIndex , 1);

            const followerIndex = await userTofollow.followers.indexOf(currUserId)
            userTofollow.followers.splice(followerIndex ,1);

            await currUser.save()
            await userTofollow.save();
            return res.send(success(200 , 'user unfollowed success'))


        }
        else{
            currUser.following.push(userIdTofollow);
            userTofollow.followers.push(currUserId);
    
            await currUser.save()
            await userTofollow.save();
            return res.send(success(200 , 'user followed success'))
        }
        
    }
    catch(e){
        return res.send(error(500 , e.message))
    }
}
const getAllPostController = async (req,res) => {

    try{
        const userId = req._id; 
        const currUser = await User.findById(userId)

        const Posts = await post.find({
            'owner' : {
                '$in' : currUser.following
            }
         })  

        res.send(success(200 , Posts))
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

const deleteUserController = async (req ,res) =>{
    try{
   
        const curuserId = req._id;
        const curUser = await User.findById(curuserId)
        //delete all the post created by the user to delete
        await post.deleteMany({
            owner : curuserId
        })
        
        
        //delete user from followings of followers
        curUser.followers.forEach(async (followerId) =>{
            const followerUser = await  User.findById(followerId);
            const index =   followerUser?.following?.indexOf(curuserId);
            followerUser?.splice(index ,1);
            await followerUser?.save()
        })

        curUser.following.forEach(async (followingId) =>{
            const followingUser = await User.findById(followingId);
            const index =   followingUser?.followers?.indexOf(curuserId);
            followingUser?.splice(index ,1);
            await followingUser?.save()   
        })

        //deleting all the likes done by this user 
        const allPosts = await post.find();
        allPosts.forEach(async (posts) =>{
            const index = posts.likes.indexOf(curuserId)
            posts.likes.splice(index ,1);
            await posts.save()
        })

        await User.findOneAndDelete({ _id: curuserId });
        
        res.clearCookie('jwt' ,{
            httpOnly : true,
            secure : true
        })
        return res.send(200 , 'user delete sucessfully') 
    }
    catch(e){
        return res.send(error(500, e.message))

    }
}

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
module.exports = {
    postController,
    createPostController,
    likeAndUnlikePostController,
    followController,
    getAllPostController,
    updatePostController,
    deleteUserController,
    deletePostController,
    getMyPostController,
    getUserPostController
}
