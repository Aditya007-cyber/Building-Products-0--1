import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">KharchaBook</h1>
        <p className="text-xl text-muted-foreground">
          Ephemeral Intelligence for your personal finances.
          Get intelligent, categorized insights and human-readable financial narratives instantly, without sacrificing privacy.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/login">
            <Button size="lg" className="px-8">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
