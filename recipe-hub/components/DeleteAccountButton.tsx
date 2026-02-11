"use client"

import { useState } from 'react'
import { UserMinus, X } from 'lucide-react'

interface DeleteAccountButtonProps {
  variant?: 'desktop' | 'mobile'
  onDone?: () => void
}

export default function DeleteAccountButton({ variant = 'desktop', onDone }: DeleteAccountButtonProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleDelete() {
    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      setError(payload?.error ?? 'Failed to delete account')
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
    onDone?.()
    setTimeout(() => {
      window.location.href = '/'
    }, 1200)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={variant === 'mobile' ? 'flex items-center gap-2 text-red-600' : 'w-full'}
      >
        <span className={variant === 'mobile' ? 'flex items-center gap-2' : 'relative group flex flex-row items-center gap-2 text-red-600'}>
          <UserMinus size={20} /> Delete Account
          {variant === 'desktop' && (
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
          )}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Confirm Account Deletion</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enter your password to permanently delete your account.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">Account deleted. Redirecting...</p>}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
