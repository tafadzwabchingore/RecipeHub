import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-gray-600">Log in to your account</p>
        <LoginForm />
        <Link href="/register" className="block text-center text-blue-600 hover:text-blue-800">Don't have an account? Register</Link>
      </div>
    </div>
  );
}