import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from the dist directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
}

// API Routes
app.get('/api/test', (_req: Request, res: Response) => {
  res.json({ message: 'Backend server is running!' })
})

// Handle SPA routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err)
})