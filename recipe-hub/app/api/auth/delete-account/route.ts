import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient, createClient as createPublicClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { password } = (await req.json()) as { password?: string }
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 })
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey || !anonKey) {
      return NextResponse.json({ error: 'Server is missing Supabase service role key.' }, { status: 500 })
    }

    const publicClient = createPublicClient(url, anonKey)
    const { error: signInError } = await publicClient.auth.signInWithPassword({
      email: user.email ?? '',
      password
    })
    if (signInError) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const admin = createAdminClient(url, serviceRoleKey)

    await admin.from('favorites').delete().eq('user_id', user.id)
    await admin.from('ratings').delete().eq('user_id', user.id)
    await admin.from('recipes').delete().eq('user_id', user.id)

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
