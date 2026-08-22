import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { WorkoutSchedule } from '@eazybox/shared'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/auth-context'

export function Dashboard() {
  const { user, logout } = useAuth()
  const [schedule, setSchedule] = useState<WorkoutSchedule[]>([])

  useEffect(() => {
    void apiFetch<WorkoutSchedule[]>('/workout-schedule')
      .then(setSchedule)
      .catch(() => setSchedule([]))
  }, [])

  return (
    <main
      className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6"
      data-testid="dashboard"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">EazyBox</h1>
          <p className="text-sm text-muted-foreground" data-testid="current-user">
            {user?.firstName} {user?.lastName} — {user?.email}
          </p>
        </div>
        <Button variant="ghost" data-testid="logout" onClick={() => void logout()}>
          Sair
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Grade semanal</CardTitle>
          <CardDescription>
            {schedule.length} horário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {schedule.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum horário cadastrado ainda.
            </p>
          )}
          {schedule.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <span className="font-medium">{slot.weekDay}</span>
              <span className="text-sm text-muted-foreground">{slot.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
