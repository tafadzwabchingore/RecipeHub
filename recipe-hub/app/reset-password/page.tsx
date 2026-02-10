'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const hashParams = new URLSearchParams(hash)
    const queryParams = new URLSearchParams(window.location.search)

    const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token') ?? queryParams.get('refresh_token')
    const code = queryParams.get('code')

    async function setSession() {
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        setReady(true)
        return
      }

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
      }
      setReady(true)
    }

    setSession()
  }, [supabase])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const form = new FormData(e.currentTarget)
      const password = String(form.get('password') ?? '')
      const confirm = String(form.get('confirm') ?? '')

      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        setLoading(false)
        return
      }
      if (password !== confirm) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/login'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-gray-600">Set a new password for your account.</p>

        {!ready && <p className="mt-4 text-gray-500">Preparing reset form...</p>}

        {ready && (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New password</label>
              <input id="password" type="password" name="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input id="confirm" type="password" name="confirm" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              {loading ? 'Saving...' : 'Update password'}
            </button>

            {success && <p className="text-green-600">Password updated. Redirecting to login...</p>}
            {error && <p className="text-red-500">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
