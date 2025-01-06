import React from 'react'
import ModeToggle from './ModeToggle';
import { Button } from './ui/button';
import { HomeIcon, Link } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';

async function DesktopNavbar() {
    const user = await currentUser();


  return (
    <div className='hidden md:flex items-center space-x-4'>
        <ModeToggle></ModeToggle>

        <Button variant="ghost" className='flex items-center gap-2' asChild>
            <Link href='/'>
                <HomeIcon className='w-4 h-4'></HomeIcon>
                <span className='hidden lg:inline'>Home</span>
            </Link>
        </Button>

        
    </div>
  )
}

export default DesktopNavbar