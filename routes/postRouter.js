const { postController, createPostController, likeAndUnlikePostController, deletePostController, getMyPostController, getUserPostController } = require("../controllers/postController");

const requireUser = require('../middleware/requireUser')
const router = require("express").Router();

router.get('/all' ,requireUser ,postController);   
 
router.post('/' , requireUser , createPostController )
router.post('/like' , requireUser , likeAndUnlikePostController)
router.delete('/delete' ,requireUser , deletePostController )
router.get('/getMyPost' ,requireUser , getMyPostController )
router.get('/getUserPost' ,requireUser , getUserPostController )
module.exports = router;