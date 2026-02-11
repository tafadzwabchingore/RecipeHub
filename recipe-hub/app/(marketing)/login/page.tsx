import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl text-gray-700 font-bold">Login</h1>
        <p className="text-gray-600">Log in to your account</p>
        <LoginForm />
        <Link href="/register" className="mt-4 block text-center text-orange-500 hover:text-orange-700">Don't have an account? Register</Link>
      </div>
    </div>
  );
}