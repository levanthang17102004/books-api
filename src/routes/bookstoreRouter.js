const Router = require('express');
const { getBookstoresByName, topRatingBookstores, topFreeshipBookstores, newCommerBookstores, getBookstoreById } = require('../controllers/bookstoreController');

const bookstoreRouter = Router();

bookstoreRouter.get('/', getBookstoresByName);
bookstoreRouter.post('/top-rating', topRatingBookstores);
bookstoreRouter.post('/newcommer', newCommerBookstores);
bookstoreRouter.post('/top-freeship', topFreeshipBookstores);
bookstoreRouter.get('/:id', getBookstoreById);

module.exports = bookstoreRouter;

