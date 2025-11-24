const { Router } = require('express');
const { likeBookstore, getLikedBookstores,deleteLike } = require('../controllers/likeController');
const verifyToken = require('../middleware/authMiddleware');

const likeRouter = Router();

likeRouter.post('/',verifyToken, likeBookstore);
likeRouter.post('/delete',verifyToken, deleteLike);
likeRouter.get('/',verifyToken, getLikedBookstores);
module.exports = likeRouter;
