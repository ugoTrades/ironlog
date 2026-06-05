import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-bg relative">
      <div className="pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
