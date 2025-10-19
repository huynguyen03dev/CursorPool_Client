require('dotenv').config()
const express = require('express')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

const apiRouter = express.Router()

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 200,
    msg: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    code: '0',
  })
})

app.use('/api', apiRouter)

app.use(errorHandler)

const PORT = process.env.PORT || 3000

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`API base URL: http://localhost:${PORT}/api`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

module.exports = app
