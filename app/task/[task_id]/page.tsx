'use client'


import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CustomScroll } from 'react-custom-scroll';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import CreateNewTask from '@/components/create-new-task';
import moment from 'moment';
import { CalendarIcon, Filter, Trash  } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RenderTaskCard from '@/components/render-task-card';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';


type Checked = DropdownMenuCheckboxItemProps["checked"]

interface Task {
  id: string;
  title: string;
  emoji: string;
  completed: boolean;
  completeByTimestamp: number;
  completedAt: string;
}

interface TaskList {
  id: string;
  title: string;
  emoji: string;
  tasks: Task[];
}

export default function Page() {
  const { task_id } = useParams();
  const { subscribeToTasks, deleteList } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<TaskList | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [showAll, setShowAll] = React.useState<Checked>(true);
  const [filterDate, setFilterDate] = React.useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  // pesky set up for the task page

  useEffect(() => {
    if (task_id) { // If there's a task ID, fetch the data
      const id = task_id as string;

      const fetchData = async () => {
        subscribeToTasks(id, (data) => { // Subscribe to the task data, for real-time updates
          setData(data); // Set the data
        });
      }

      fetchData(); // call the function
    }
  }, [task_id]); // Run this effect if the task ID changes, kinda useless in this context but it's good practice

  useEffect(() => {
    if (data) { // if there's data
      const completed = data.tasks.filter((task: Task) => task.completed);
      const incomplete = data.tasks.filter((task: Task) => !task.completed);
      const overdue = incomplete.filter((task: Task) => moment(task.completeByTimestamp).isBefore(moment(), 'minute'));

      const filteredCompleted = completed.sort((a: Task, b: Task) => moment(a.completedAt).diff(moment(b.completedAt)));
      const filteredIncomplete = incomplete.filter((task: Task) => !overdue.includes(task) && moment(task.completeByTimestamp).isSame(filterDate, 'day')).sort((a: Task, b: Task) => moment(a.completeByTimestamp).diff(moment(b.completeByTimestamp)));
      const filteredOverdue = overdue.sort((a: Task, b: Task) => moment(a.completeByTimestamp).diff(moment(b.completeByTimestamp)));
      
      setCompletedTasks(filteredCompleted);
      setIncompleteTasks(filteredIncomplete);
      setOverdueTasks(filteredOverdue);

      // lots of filtering shinanigans, this is where the magic happens. Could it be optimized? Probably but it works

      if (showAll) { // if showAll is true, show all tasks
        setIncompleteTasks(incomplete.filter((task: Task) => !overdue.includes(task)).sort((a: Task, b: Task) => moment(a.completeByTimestamp).diff(moment(b.completeByTimestamp))));
      } else { // if showAll is false, show only tasks that match the filterDate.
        setIncompleteTasks(filteredIncomplete);
      }
    }
  }, [data, filterDate, showAll]) // Run this effect if the data, filterDate or showAll changes. This is necessary for the filtering to work, unlike the previous useEffect

  if (!data) { // should never happen but just in case
    return null;
  }

  return (
    <div className='px-20 py-10 flex flex-col flex-1 justify-between'>
      
      <div className='flex gap-4 flex-col h-full max-h-full overflow-hidden'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className='flex items-center gap-2 justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-3xl'>{data.emoji}</span>
            <h1 className='text-2xl font-bold tracking-tight'>{data.title}</h1>
          </div>

          <div className='flex items-center gap-2'>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger>
              <Button>
                <CalendarIcon />
                  {showAll ? 'Displaying All' : moment(filterDate).calendar(null, {
                    sameDay: '[Today]',
                    nextDay: '[Tomorrow]',
                    nextWeek: 'dddd',
                    lastDay: '[Yesterday]',
                    lastWeek: '[Last] dddd',
                    sameElse: 'DD/MM/YYYY'
                  })}
              </Button>
            </PopoverTrigger>
            <PopoverContent side='bottom' align='end'>
                <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={(date) => {
                        setFilterDate(date)
                        setCalendarOpen(false)
                        setShowAll(false)
                    }}
                    />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="default">
                <span className="sr-only">Open menu</span>
                <Filter />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align='end'>
              <DropdownMenuLabel>Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={showAll} onCheckedChange={setShowAll}>All</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

            <AlertDialog>
              <AlertDialogTrigger asChild> 
                <Button variant='destructive'>
                  <Trash />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this list and all of its tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    deleteList(data.id)
                    router.push('/')
                  }}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>
          <Tabs defaultValue='pending' className='relative flex-1 h-full overflow-hidden'>
            <TabsList>
              <TabsTrigger value="pending" className='flex gap-2'><p>Pending Tasks</p> <Badge variant='secondary'>{incompleteTasks.length}</Badge></TabsTrigger>
              <TabsTrigger value="complete" className='flex gap-2'><p>Completed Tasks</p> <Badge variant='secondary'>{completedTasks.length}</Badge></TabsTrigger>
              <TabsTrigger value="overdue" className='flex gap-2'><p>Overdue Tasks</p> {overdueTasks.length > 0 && (<Badge variant='destructive'>{overdueTasks.length}</Badge>)}</TabsTrigger>
            </TabsList>
                <TabsContent value="pending" className='max-h-[94%] overflow-hidden'>
                  {incompleteTasks.length === 0 && (<p className='text-base text-gray-500 tracking-tight font-semibold'>Theres no tasks here!</p>)}

                  <CustomScroll heightRelativeToParent='100%'>
                      {incompleteTasks.map((task: Task) => (
                        <>
                         <RenderTaskCard task={task} task_id={task.id} parent_id={data?.id} />
                        </>
                      ))}
                  </CustomScroll>
                </TabsContent>

                <TabsContent value="complete" className='max-h-[94%] overflow-hidden'>
                  {completedTasks.length === 0 && (<p className='text-base text-gray-500 tracking-tight font-semibold'>Theres no tasks here!</p>)}

                  <CustomScroll heightRelativeToParent='100%'>
                      {completedTasks.map((task: Task) => (
                        <>
                         <RenderTaskCard task={task} task_id={task.id} parent_id={data?.id} />
                        </>
                      ))}
                  </CustomScroll>
                </TabsContent>

                <TabsContent value="overdue" className='max-h-[94%] overflow-hidden'>
                  {overdueTasks.length === 0 && (<p className='text-base text-gray-500 tracking-tight font-semibold'>Nice job! You have no overdue tasks</p>)}

                  <CustomScroll heightRelativeToParent='100%'>
                      {overdueTasks.map((task: Task) => (
                        <>
                         <RenderTaskCard task={task} task_id={task.id} parent_id={data?.id} />
                        </>
                      ))}
                  </CustomScroll>
                </TabsContent>
            </Tabs>

      </div>

      <div className='w-full mt-4'>
        <CreateNewTask task_id={data?.id} task_emoji={data?.emoji}/>
      </div>
    </div>
  )
}
