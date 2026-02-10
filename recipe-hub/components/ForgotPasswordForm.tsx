"use client"

import { useState } from 'react'

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const form = new FormData(e.currentTarget)
      const res = await fetch('/api/auth/forgot', { method: 'POST', body: form })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        setError(payload?.error ?? 'Failed to send reset email')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input id="email" type="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700">
        {loading ? 'Sending...' : 'Send reset email'}
      </button>

      {success && <p className="text-green-600">Check your email for a reset link.</p>}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  )
}
