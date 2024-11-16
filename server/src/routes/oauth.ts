import { Router } from 'express'
import { PinterestService } from '../services/pinterest'

const router = Router()
const pinterestService = PinterestService.getInstance()

router.post('/pinterest/callback', async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' })
    }

    // Exchange code for token
    const tokenData = await pinterestService.exchangeCodeForToken(code)

    // Get user profile
    const user = await pinterestService.getUserProfile(tokenData.access_token)

    // Return token and user data
    res.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      user,
    })
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    res.status(500).json({
      error: 'Failed to complete OAuth process',
      details: error.message,
    })
  }
})

router.post('/pinterest/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const tokenData = await pinterestService.refreshToken(refresh_token)
    res.json(tokenData)
  } catch (error: any) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Failed to refresh token',
      details: error.message,
    })
  }
})

export default router
