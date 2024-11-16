import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
import CreatePin from '../pages/CreatePin'
import Queue from '../pages/Queue'
import Schedule from '../pages/Schedule'
import Analytics from '../pages/Analytics'
import Settings from '../pages/Settings'

export default function Router() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreatePin />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
