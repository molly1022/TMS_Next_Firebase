'use client';

import { useAuth } from "@/context/AuthContext";
import { CustomScroll } from "react-custom-scroll";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";
import RenderTaskCard from "@/components/render-task-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Task {
  emoji: string;
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completeByTimestamp: number;
  parentTaskId: string;
}

interface TaskList {
  id: string;
  title: string;
  tasks: Task[];
}

export default function Home() {
  const { user, userData, getTasksData } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user && !userData) {
      return;
    } else {
      const fetchTasks = async () => {
        // Fetch tasks for each list
        const tasksData = await Promise.all(
          userData?.taskList?.map(async (taskList: TaskList) => {
            // Skip if there's no valid ID
            if (!taskList?.id) return null;
            return await getTasksData(taskList.id);
          }) || []
        );

        // Filter out invalid results
        const validTasksData = tasksData.filter(Boolean) as TaskList[];

        if (!validTasksData.length) return;

        // Flatten all tasks
        const allTasks = validTasksData.flatMap(
          (taskData) => taskData?.tasks || []
        );

        // Grab incomplete tasks
        const incompleteTasks = allTasks.filter((task: Task) => !task.completed);

        // Overdue tasks
        const overdueTasks = incompleteTasks.filter((task: Task) =>
          moment(task.completeByTimestamp).isBefore(moment(), "minute")
        );

        // Sort incomplete tasks by timestamp
        const sortedIncomplete = incompleteTasks
          .filter((task: Task) => !overdueTasks.includes(task))
          .sort((a: Task, b: Task) =>
            moment(a.completeByTimestamp).diff(moment(b.completeByTimestamp))
          );

        // Filter tasks due today
        const sortedToday = sortedIncomplete.filter((task: Task) =>
          moment(task.completeByTimestamp).isSame(moment(), "day")
        );

        // Filter tasks that are upcoming
        const sortedUpcoming = sortedIncomplete.filter((task: Task) =>
          moment(task.completeByTimestamp).isAfter(moment(), "day")
        );

        setTodayTasks(sortedToday);
        setUpcomingTasks(sortedUpcoming);
      };

      fetchTasks();
    }
  }, [user, userData]);

  if (!user || !userData) {
    return;
  }

  return (
    <div className="flex flex-col flex-1 px-20 py-14 max-h-screen overflow-hidden">
      <div>
        <h1 className="text-4xl font-bold">Hello, {userData.displayName}</h1>
        <p className="text-base text-gray-500 tracking-tight font-semibold">{new Date().toLocaleDateString('en-US', {weekday: 'long',year: 'numeric', month: 'long', day: 'numeric'})}</p>
        
        <div className="flex gap-4 mt-6 mb-2">
        <h1 className='text-2xl font-bold tracking-tight'>Task dashboard</h1>
        </div>
        <Tabs defaultValue={todayTasks.length > upcomingTasks.length ? "today" : "upcoming"}>
          <TabsList>
            <TabsTrigger value="today" className='flex gap-2'><p>Today</p> <Badge variant='secondary'>{todayTasks.length}</Badge></TabsTrigger>
            <TabsTrigger value="upcoming"className='flex gap-2'><p>Upcoming</p> <Badge variant='secondary'>{upcomingTasks.length}</Badge></TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <CustomScroll className="flex flex-col gap-4" heightRelativeToParent="80%">
              {todayTasks.map((task: Task) => (
                <Link href={`/task/${task.parentTaskId}`} key={task.id}>
                  <RenderTaskCard task={task} task_id={task.id} parent_id={task.parentTaskId} />
                </Link>
              ))}
              {todayTasks.length === 0 && <p className='text-base text-gray-500 tracking-tight font-semibold'>Theres no tasks here!</p>}
            </CustomScroll>
          </TabsContent>

          <TabsContent value="upcoming">
            <CustomScroll className="flex flex-col gap-4" heightRelativeToParent="80%">
              {upcomingTasks.map((task: Task) => (
                <Link href={`/task/${task.parentTaskId}`} key={task.id}>
                  <RenderTaskCard task={task} task_id={task.id} parent_id={task.parentTaskId} />
                </Link>
              ))}
              {upcomingTasks.length === 0 && <p className='text-base text-gray-500 tracking-tight font-semibold'>Theres no tasks here!</p>}
            </CustomScroll>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
