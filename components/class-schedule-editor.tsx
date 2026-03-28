'use client'

import { CalendarDays, Clock3, Plus, Repeat2, Trash2 } from 'lucide-react'

import { WEEKDAY_OPTIONS } from '@/lib/class-schedule'
import {
  adminCompactButtonClass,
  adminCompactDangerButtonClass,
  adminEditorSurfaceClass,
  adminSubtlePanelClass,
  adminSurfaceInputClass,
} from '@/lib/admin/surface'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export interface EditableScheduleRule {
  id: string
  weekday: number
  startTime: string
  endTime: string
}

export interface EditableClassSession {
  id: string
  sessionDate: string
  startTime: string
  endTime: string
  source: 'RULE' | 'MANUAL'
}

interface ClassScheduleEditorProps {
  yearMonth: string
  rules: EditableScheduleRule[]
  sessions: EditableClassSession[]
  canEditRules: boolean
  onRulesChange: (nextRules: EditableScheduleRule[]) => void
  onSessionsChange: (nextSessions: EditableClassSession[]) => void
}

function createLocalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `local-${Math.random().toString(36).slice(2, 10)}`
}

export function ClassScheduleEditor({
  yearMonth,
  rules,
  sessions,
  canEditRules,
  onRulesChange,
  onSessionsChange,
}: ClassScheduleEditorProps) {
  return (
    <div className="space-y-3">
      <section className={adminEditorSurfaceClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-[#314127]">
              <Repeat2 className="h-4 w-4 text-[#5d8b38]" />
              <span>반복 일정</span>
            </div>
            <p className="mt-1 text-sm text-[#68785c]">
              수업 생성과 이후 기본 반복 규칙입니다. 같은 반은 여러 요일을 함께 가질 수 있습니다.
            </p>
          </div>
          {canEditRules ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                onRulesChange([
                  ...rules,
                  {
                    id: createLocalId(),
                    weekday: 1,
                    startTime: '16:00',
                    endTime: '',
                  },
                ])
              }
              className={adminCompactButtonClass}
            >
              <Plus className="h-4 w-4" />
              반복 추가
            </Button>
          ) : null}
        </div>

        {!canEditRules ? (
          <div className="rounded-[1.15rem] border border-[#e7e8df] bg-[#f6f7f2] px-3.5 py-3 text-sm text-[#6b7561]">
            반복 일정 자체는 owner만 수정할 수 있습니다. admin은 아래 월별 실제 날짜만 조정할 수 있습니다.
          </div>
        ) : null}

        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={rule.id} className={adminSubtlePanelClass}>
              <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto]">
                <div className="space-y-2">
                  <Label htmlFor={`rule-weekday-${rule.id}`}>요일</Label>
                  <select
                    id={`rule-weekday-${rule.id}`}
                    value={String(rule.weekday)}
                    onChange={(event) =>
                      onRulesChange(
                        rules.map((item) =>
                          item.id === rule.id ? { ...item, weekday: Number(event.target.value) } : item,
                        ),
                      )
                    }
                    disabled={!canEditRules}
                    className={`${adminSurfaceInputClass} h-11`}
                  >
                    {WEEKDAY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}요일
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rule-start-${rule.id}`}>시작</Label>
                  <input
                    id={`rule-start-${rule.id}`}
                    type="time"
                    value={rule.startTime}
                    onChange={(event) =>
                      onRulesChange(
                        rules.map((item) =>
                          item.id === rule.id ? { ...item, startTime: event.target.value } : item,
                        ),
                      )
                    }
                    disabled={!canEditRules}
                    className={`${adminSurfaceInputClass} h-11`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rule-end-${rule.id}`}>종료</Label>
                  <input
                    id={`rule-end-${rule.id}`}
                    type="time"
                    value={rule.endTime}
                    onChange={(event) =>
                      onRulesChange(
                        rules.map((item) =>
                          item.id === rule.id ? { ...item, endTime: event.target.value } : item,
                        ),
                      )
                    }
                    disabled={!canEditRules}
                    className={`${adminSurfaceInputClass} h-11`}
                  />
                </div>
                <div className="flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onRulesChange(rules.filter((item) => item.id !== rule.id))}
                    disabled={!canEditRules || rules.length <= 1}
                    className={adminCompactDangerButtonClass}
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-[#7b866e]">반복 규칙 {index + 1}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={adminEditorSurfaceClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-[#314127]">
              <CalendarDays className="h-4 w-4 text-[#5a79c9]" />
              <span>{yearMonth} 실제 수업 날짜</span>
            </div>
            <p className="mt-1 text-sm text-[#68785c]">
              이달 수업 날짜를 직접 조정합니다. 여기에서 추가/이동/삭제한 내용이 출석 기준이 됩니다.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              onSessionsChange([
                ...sessions,
                {
                  id: createLocalId(),
                  sessionDate: `${yearMonth}-01`,
                  startTime: '16:00',
                  endTime: '',
                  source: 'MANUAL',
                },
              ])
            }
            className={adminCompactButtonClass}
          >
            <Plus className="h-4 w-4" />
            날짜 추가
          </Button>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="rounded-[1.2rem] border border-dashed border-[#d9e3c9] bg-[#fbfcf6] px-4 py-6 text-sm text-[#6b7d5e]">
              아직 이달 실제 수업 날짜가 없습니다.
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className={adminSubtlePanelClass}>
                <div className="grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto]">
                  <div className="space-y-2">
                    <Label htmlFor={`session-date-${session.id}`}>날짜</Label>
                    <input
                      id={`session-date-${session.id}`}
                      type="date"
                      value={session.sessionDate}
                      onChange={(event) =>
                        onSessionsChange(
                          sessions.map((item) =>
                            item.id === session.id ? { ...item, sessionDate: event.target.value } : item,
                          ),
                        )
                      }
                      className={`${adminSurfaceInputClass} h-11`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`session-start-${session.id}`}>시작</Label>
                    <input
                      id={`session-start-${session.id}`}
                      type="time"
                      value={session.startTime}
                      onChange={(event) =>
                        onSessionsChange(
                          sessions.map((item) =>
                            item.id === session.id ? { ...item, startTime: event.target.value } : item,
                          ),
                        )
                      }
                      className={`${adminSurfaceInputClass} h-11`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`session-end-${session.id}`}>종료</Label>
                    <input
                      id={`session-end-${session.id}`}
                      type="time"
                      value={session.endTime}
                      onChange={(event) =>
                        onSessionsChange(
                          sessions.map((item) =>
                            item.id === session.id ? { ...item, endTime: event.target.value } : item,
                          ),
                        )
                      }
                      className={`${adminSurfaceInputClass} h-11`}
                    />
                  </div>
                  <div className="flex items-end justify-end gap-2">
                    <span className="inline-flex h-10 items-center rounded-full border border-[#d9e4f7] bg-[#f4f8ff] px-3 text-xs font-semibold text-[#5776b4]">
                      <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                      {session.source === 'RULE' ? '반복 기반' : '수동 추가'}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onSessionsChange(sessions.filter((item) => item.id !== session.id))}
                      className={adminCompactDangerButtonClass}
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
