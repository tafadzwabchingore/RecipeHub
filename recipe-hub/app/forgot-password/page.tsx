import Link from 'next/link'
import ForgotPasswordForm from '@/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-gray-600">Enter your email to receive a reset link.</p>
        <ForgotPasswordForm />
        <Link href="/login" className="mt-4 block text-center text-orange-500 hover:text-orange-700">
          Back to login
        </Link>
      </div>
    </div>
  )
}
