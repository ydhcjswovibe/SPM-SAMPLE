'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Loader2, 
  Save, 
  CheckCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { useTheme } from 'next-themes'
import type { Profile } from '@/lib/types'

const supabase = createClient()

async function fetchProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: profile, mutate } = useSWR('profile', fetchProfile)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName || null })
        .eq('id', profile.id)

      if (error) throw error

      await mutate()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  // Demo mode - show mock profile when not logged in
  const demoProfile = {
    id: 'demo',
    email: 'admin@demo.com',
    full_name: 'Demo Admin',
    role: 'admin' as const,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const displayProfile = profile || demoProfile

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <h1 className="font-semibold text-lg">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>View and edit your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={displayProfile.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{displayProfile.full_name || 'No name'}</span>
                <span className="text-sm text-muted-foreground">{displayProfile.email}</span>
                <span className="text-xs text-primary mt-1">
                  {displayProfile.role === 'admin' ? 'Admin' : 'Student'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Name</Label>
              <Input
                id="fullName"
                value={fullName || displayProfile.full_name || ''}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={displayProfile.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving || !profile} className="gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Theme</CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
