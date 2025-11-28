import { useEffect, useState } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react'

/**
 * Custom auth hook that wraps Clerk's authentication
 * Works with Clerk when configured
 */
export const useAuth = () => {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser()
  const { getToken } = useClerkAuth()

  // Store token in session storage when user signs in
  useEffect(() => {
    const storeToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken()
          if (token) {
            sessionStorage.setItem('clerk_token', token)
          }
        } catch (error) {
          console.error('Error storing auth token:', error)
        }
      } else {
        sessionStorage.removeItem('clerk_token')
      }
    }

    storeToken()
  }, [isSignedIn, getToken])

  return {
    user,
    isLoaded: isUserLoaded,
    isSignedIn: isSignedIn || false,
    userId: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl,
    getToken,
  }
}

export default useAuth
