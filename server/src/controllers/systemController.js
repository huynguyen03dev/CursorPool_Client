const db = require('../config/database')
const { sendSuccess, sendError } = require('../utils/response')

const getPublicInfo = async (req, res) => {
  try {
    const result = await db.get(
      `SELECT value FROM public_info WHERE key = 'announcement' AND status = 1`,
    )

    if (result && result.value) {
      const info = JSON.parse(result.value)
      sendSuccess(res, info)
    } else {
      sendSuccess(res, {
        type: 'info',
        closeable: true,
        props: {
          title: 'Welcome to CursorPool',
          description: 'No announcements at this time.',
        },
        actions: [],
      })
    }
  } catch (error) {
    console.error('Get public info error:', error)
    sendError(res, 'Failed to retrieve public information', 500)
  }
}

const getArticleList = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1
    const pageSize = 10
    const offset = (page - 1) * pageSize

    const articles = await db.query(
      `SELECT id, title, content FROM articles WHERE status = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [pageSize, offset],
    )

    const total = await db.get(`SELECT COUNT(*) as count FROM articles WHERE status = 1`)

    sendSuccess(res, {
      articles,
      total: total.count,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Get article list error:', error)
    sendError(res, 'Failed to retrieve articles', 500)
  }
}

const reportBug = async (req, res) => {
  try {
    const {
      api_key,
      app_version,
      os_version,
      device_model,
      cursor_version,
      bug_description,
      occurrence_time,
      screenshot_urls,
      severity,
    } = req.body

    if (
      !app_version ||
      !os_version ||
      !device_model ||
      !cursor_version ||
      !bug_description ||
      !occurrence_time ||
      !severity
    ) {
      return sendError(res, 'Missing required fields', 400)
    }

    const description = JSON.stringify({
      api_key,
      app_version,
      os_version,
      device_model,
      cursor_version,
      bug_description,
      occurrence_time,
      screenshot_urls: screenshot_urls || [],
      severity,
    })

    await db.run(`INSERT INTO bug_reports (description, status) VALUES (?, 0)`, [description])

    sendSuccess(res, { message: 'Bug report submitted successfully' })
  } catch (error) {
    console.error('Report bug error:', error)
    sendError(res, 'Failed to submit bug report', 500)
  }
}

const getVersion = (req, res) => {
  res.json({ version: '1.0.0' })
}

module.exports = {
  getPublicInfo,
  getArticleList,
  reportBug,
  getVersion,
}
