import React from 'react'
import BottomNav from './bottom-nav'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

