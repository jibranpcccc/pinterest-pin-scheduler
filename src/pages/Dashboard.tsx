import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  ChartBarIcon,
  ClockIcon,
  PhotoIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { scheduledPins } = useSelector((state: RootState) => state.scheduler)
  const { boards } = useSelector((state: RootState) => state.boards)

  const stats = [
    {
      name: 'Total Scheduled Pins',
      value: scheduledPins.length,
      icon: PhotoIcon,
    },
    {
      name: 'Active Boards',
      value: boards.length,
      icon: ChartBarIcon,
    },
    {
      name: 'Upcoming Pins',
      value: scheduledPins.filter(pin => new Date(pin.scheduledTime || '') > new Date()).length,
      icon: ClockIcon,
    },
    {
      name: 'Monthly Growth',
      value: '+12.5%',
      icon: ArrowTrendingUpIcon,
    },
  ]

  const recentPins = scheduledPins
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.scheduledTime || '').getTime()
      const dateB = new Date(b.scheduledTime || '').getTime()
      return dateB - dateA
    })
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of your Pinterest scheduling activity and performance metrics.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-primary-500 p-3">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </dd>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {recentPins.map((pin, index) => (
              <li key={index}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="flex">
                          <p className="truncate text-sm font-medium text-primary-600">
                            {pin.title || 'Untitled Pin'}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon
                              className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            <p>
                              Scheduled for{' '}
                              {new Date(pin.scheduledTime || '').toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-shrink-0">
                        <img
                          src={pin.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
