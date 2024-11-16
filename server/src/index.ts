import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { requestLogging, errorLogging } from './middleware/logging'
import pinterestRoutes from './routes/pinterest'

const app = express()
const port = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Request parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use(requestLogging)

// Routes
app.use('/api/pinterest', pinterestRoutes)

// Error handling
app.use(errorLogging)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.status || 500
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
