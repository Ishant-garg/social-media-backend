const { followController, getAllPostController , updatePostController, deleteUserController } = require('../controllers/postController')
const requireUser = require('../middleware/requireUser')

const router = require('express').Router()

router.post('/follow' , requireUser , followController)
router.get('/allpost' , requireUser , getAllPostController)
router.put('/updatePost' , requireUser , updatePostController)
router.delete('/delete' , requireUser , deleteUserController)

module.exports = router