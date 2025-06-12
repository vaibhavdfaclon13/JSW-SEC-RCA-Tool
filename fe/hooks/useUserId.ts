"use client"

import { useState, useEffect } from 'react'

export const useUserId = () => {
  const [userId, setUserIdState] = useState<string>('')
  const [selectedInsightId, setSelectedInsightIdState] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get userId from server on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setError(null)
        // Try to get the last used userId from localStorage temporarily for session continuity
        const tempUserId = localStorage.getItem('temp_user_id')
        console.log('Checking for temp user ID:', tempUserId)
        
        if (tempUserId) {
          console.log('Found temp user ID, checking server...')
          const response = await fetch(`/api/user?userId=${encodeURIComponent(tempUserId)}`)
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`)
          }
          const data = await response.json()
          console.log('Server response:', data)
          
          if (data.exists) {
            setUserIdState(data.userId)
            setSelectedInsightIdState(data.selectedInsightId || '')
          } else {
            // Clear invalid temp user ID
            localStorage.removeItem('temp_user_id')
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const setUserId = async (newUserId: string) => {
    try {
      setUserIdState(newUserId)
      // Store temporarily in localStorage for session continuity
      localStorage.setItem('temp_user_id', newUserId)
      
      // Store on server
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: newUserId }),
      })

      if (!response.ok) {
        throw new Error('Failed to store user data on server')
      }

      const data = await response.json()
      setSelectedInsightIdState(data.userData.selectedInsightId || '')
    } catch (error) {
      console.error('Error storing user data:', error)
    }
  }

  const setSelectedInsightId = async (insightId: string) => {
    try {
      setSelectedInsightIdState(insightId)
      
      if (userId) {
        // Store on server
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: userId, 
            selectedInsightId: insightId 
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to store insight data on server')
        }
      }
    } catch (error) {
      console.error('Error storing insight data:', error)
    }
  }

  const clearUserId = async () => {
    try {
      if (userId) {
        // Remove from server
        await fetch(`/api/user?userId=${encodeURIComponent(userId)}`, {
          method: 'DELETE',
        })
      }
      
      setUserIdState('')
      setSelectedInsightIdState('')
      localStorage.removeItem('temp_user_id')
    } catch (error) {
      console.error('Error clearing user data:', error)
    }
  }

  const hasUserId = Boolean(userId)

  return {
    userId,
    selectedInsightId,
    setUserId,
    setSelectedInsightId,
    clearUserId,
    hasUserId,
    isLoading,
    error
  }
} 