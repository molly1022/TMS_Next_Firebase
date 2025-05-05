
import { useAuth } from '@/context/AuthContext';
import React from 'react'
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import moment from 'moment';
import { Trash } from 'lucide-react';
import { Card } from './ui/card';


interface RenderTaskCardProps {
    task: {
        emoji: string,
        title: string,
        completeByTimestamp: number,
        completed: boolean,
    },
    task_id: string,
    parent_id: string
}

export default function RenderTaskCard({ task, task_id, parent_id }: RenderTaskCardProps) {
    const { markTaskAsComplete } = useAuth(); // we need to mark the task as complete
    const buttonRef = React.useRef<HTMLButtonElement>(null); // we need a ref to the button

    const handleTaskCompletion = async (task_id: string, task_id_to_update: string) => { // we need to handle the task completion
        try {
            markTaskAsComplete(task_id, task_id_to_update) // we need to mark the task as complete
        } catch (error) {
            toast.error(error as string) // if we get an error we show it to the user. as a string, of course. Thanks TypeScript again!
        }
    }

    return (
        <Card className='flex items-center justify-between p-3 rounded-xl mb-2 bg-background/5 shadow-none'>
            <div className='flex items-center gap-3'>
                <div className='px-3 h-10 rounded-lg bg-secondary flex items-center justify-center'>
                    <span className='text-xl'>{task.emoji}</span>
                </div>
                <span className='font-semibold text-base tracking-tight'>{task.title}</span>
                {task.completeByTimestamp < Date.now() && !task.completed && (
                    <Badge variant='destructive'>Overdue</Badge>
                )}
                {task.completed && (
                    <Badge variant='default'>Completed</Badge>
                )}
                {task.completeByTimestamp > Date.now() && !task.completed && (
                    <Badge variant='secondary'>Due {moment(task.completeByTimestamp).fromNow()}</Badge>
                )}
            </div>

            <div className='flex items-center gap-1 relative'>
                {
                    !task.completed && (
                    
                        <Button 
                            ref={buttonRef}
                            variant='default' 
                            onClick={() => handleTaskCompletion(parent_id, task_id)} 
                            size='sm'
                        >
                            Mark As Complete
                        </Button>
                        
                    )
                }
                <Button variant='destructive' size='icon' className='w-8 h-8'><Trash /></Button>
            </div>
        </Card>
    )
}