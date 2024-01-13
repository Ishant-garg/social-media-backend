const { followController, getAllPostController , updatePostController, deleteUserController, getMyProfile, updateUserProfile, getUserProfile, feedDataController } = require('../controllers/postController')
const requireUser = require('../middleware/requireUser')

const router = require('express').Router()

router.post('/follow' , requireUser , followController)
router.get('/getfeedData' , requireUser , feedDataController)
router.put('/updatePost' , requireUser , updatePostController)
router.delete('/delete' , requireUser , deleteUserController)
router.get('/getMyProfile' , requireUser , getMyProfile)
router.post('/getUserProfile' , requireUser , getUserProfile)


router.put('/' , requireUser ,updateUserProfile)
module.exports = router