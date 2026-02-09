import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="text-gray-600">Create a new account</p>
        <RegisterForm />
      </div>
    </div>
  )
}