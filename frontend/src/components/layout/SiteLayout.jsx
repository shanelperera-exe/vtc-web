import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import ErrorBoundary from '../common/ErrorBoundary'

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
