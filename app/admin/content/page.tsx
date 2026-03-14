'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { ClassSelector } from '@/components/class-selector'
import { WeekContentEditor } from '@/components/week-content-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, AlertCircle } from 'lucide-react'
import type { Class, WeeklyContent } from '@/lib/types'

const supabase = createClient()

async function fetchClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

async function fetchWeeklyContents(classId: string): Promise<WeeklyContent[]> {
  const { data, error } = await supabase
    .from('weekly_contents')
    .select('*')
    .eq('class_id', classId)
    .order('week_number', { ascending: true })

  if (error) throw error
  return data || []
}

export default function ContentPage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [activeWeek, setActiveWeek] = useState('1')

  const { data: classes } = useSWR('classes', fetchClasses)
  
  const { data: contents, mutate: mutateContents } = useSWR(
    selectedClass ? `contents-${selectedClass.id}` : null,
    () => selectedClass ? fetchWeeklyContents(selectedClass.id) : null
  )

  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0])
    }
  }, [classes, selectedClass])

  // Ensure weekly content records exist for all weeks
  useEffect(() => {
    if (selectedClass && contents) {
      const existingWeeks = new Set(contents.map(c => c.week_number))
      const missingWeeks = Array.from({ length: selectedClass.total_weeks }, (_, i) => i + 1)
        .filter(week => !existingWeeks.has(week))

      if (missingWeeks.length > 0) {
        const newContents = missingWeeks.map(week => ({
          class_id: selectedClass.id,
          week_number: week,
          title: null,
          youtube_url: null,
          image_url: null,
          description: null,
        }))

        supabase
          .from('weekly_contents')
          .insert(newContents)
          .then(() => mutateContents())
      }
    }
  }, [selectedClass, contents, mutateContents])

  const handleContentUpdate = async (weekNumber: number, updates: Partial<WeeklyContent>) => {
    if (!selectedClass) return

    const { error } = await supabase
      .from('weekly_contents')
      .update(updates)
      .eq('class_id', selectedClass.id)
      .eq('week_number', weekNumber)

    if (error) throw error
    await mutateContents()
  }

  const getContentForWeek = (week: number): WeeklyContent | null => {
    return contents?.find(c => c.week_number === week) || null
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <h1 className="font-semibold text-lg md:hidden">콘텐츠 관리</h1>
          <div className="flex items-center gap-2">
            <ClassSelector
              classes={classes || []}
              selectedClass={selectedClass}
              onSelect={setSelectedClass}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
        {!selectedClass ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">클래스를 선택해주세요</p>
              </div>
            </CardContent>
          </Card>
        ) : !contents ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selectedClass.name} 주차별 콘텐츠
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeWeek} onValueChange={setActiveWeek}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  {Array.from({ length: selectedClass.total_weeks }, (_, i) => (
                    <TabsTrigger key={i + 1} value={String(i + 1)} className="flex-shrink-0">
                      {i + 1}주차
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Array.from({ length: selectedClass.total_weeks }, (_, i) => (
                  <TabsContent key={i + 1} value={String(i + 1)} className="mt-4">
                    <WeekContentEditor
                      content={getContentForWeek(i + 1)}
                      weekNumber={i + 1}
                      onUpdate={(updates) => handleContentUpdate(i + 1, updates)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
