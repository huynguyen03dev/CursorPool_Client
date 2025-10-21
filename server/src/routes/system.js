const express = require('express')
const router = express.Router()
const {
  getPublicInfo,
  getArticleList,
  reportBug,
  getVersion,
} = require('../controllers/systemController')

router.get('/public/info', getPublicInfo)

router.get('/article/list/:page', getArticleList)

router.post('/report', reportBug)

// GET /api/system/version - Get system version
router.get('/version', getVersion)

module.exports = router
