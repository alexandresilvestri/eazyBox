import { Outlet } from 'react-router'
import { NavRail, NavStrip } from './NavRail'
import { TopBar } from './TopBar'

export function ConsoleShell() {
  return (
    <div className="h-dvh overflow-hidden" data-testid="dashboard">
      <NavRail />
      <div className="h-full overflow-y-auto md:pl-(--rail-width)">
        <TopBar />
        <NavStrip />
        <main className="mx-auto w-full max-w-(--page-max-width) pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
