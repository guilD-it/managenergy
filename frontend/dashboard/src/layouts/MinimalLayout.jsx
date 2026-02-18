import { Outlet } from 'react-router-dom'

export default function MinimalLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Outlet />
    </div>
  )
}
