import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <Compass className="w-20 h-20 text-gray-200" />
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500">Page not found</p>
      </div>
      <button className="btn-primary" onClick={() => navigate(-1)}>
        Go back
      </button>
    </div>
  )
}
