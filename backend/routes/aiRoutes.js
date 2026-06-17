const express = require('express');
const router = express.Router();
const {
  getAiRecommendations,
  processBeautyQuiz,
  checkIngredients
} = require('../controllers/aiController');

router.post('/recommend', getAiRecommendations);
router.post('/quiz', processBeautyQuiz);
router.post('/check-ingredients', checkIngredients);

module.exports = router;
