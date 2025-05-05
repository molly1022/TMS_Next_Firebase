'use client';

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { Badge } from "@/components/ui/badge"
import { Card } from './ui/card';
import { CustomScroll } from "react-custom-scroll";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import CreateNewList from './create-new-list';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"


export default function SideBar() {
  const pathname = usePathname();
  const { userData, logout } = useAuth();
  const { setTheme } = useTheme()

  if (pathname.includes('auth') || pathname.includes('landing')) return;

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <Card className='rounded-md min-w-80 box-border border-none shadow-sm flex flex-col h-full'>
        <h1 className='font-bold text-2xl mt-4 mb-2 px-4'>Your Lists</h1>


        <div className='flex flex-col gap-1 relative justify-between flex-1 overflow-hidden'>
          <CustomScroll className='flex flex-col gap-1 relative' heightRelativeToParent='90%'>
            <div className='px-4 relative'>
              {userData?.taskList?.length === 0 && <p className='text-base text-gray-500 tracking-tight font-semibold'>You dont have any lists!</p>}
              {userData?.taskList?.sort((a: { task_count: number }, b: { task_count: number }) => b.task_count - a.task_count).map((task: { id: string, emoji: string, title: string, task_count: number }) => (
                  <Link href={`/task/${task.id}`} key={task.id}>
                    <div key={task.id} className={pathname === `/task/${task.id}` ? `flex justify-between items-center p-2 bg-secondary rounded-md` : `flex justify-between items-center p-2`}>
                    <div className='flex items-center gap-1'>
                      <span className='text-2xl'>{task.emoji}</span>
                      <span className='font-semibold text-sm tracking-tight'>{task.title}</span>
                    </div>
                    <Badge variant="outline">{task.task_count}</Badge>
                    </div>
                  </Link>
                  ))}
                  <div className='sticky bottom-0 w-full bg-background mt-3'>
                <CreateNewList />
              </div>
            </div>
          </CustomScroll>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className='p-4'>
                <div className='flex items-center gap-2 p-2 rounded-sm hover:bg-secondary transition-all cursor-pointer'>
                  <Avatar>
                    <AvatarImage src="/icon.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-base tracking-tight'>{userData.displayName}</span>
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' side='top'>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem>
                        App Theme
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side='right'>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        System
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>


        </div>
    </Card>
  )
}
 