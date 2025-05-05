'use client'
import React, {useState} from 'react'
import { Button } from './ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from './ui/input' 
import EmojiPicker, {Theme, EmojiStyle} from 'emoji-picker-react'; 
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function CreateNewList() {
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [emoji, setEmoji] = useState('💪')
  const [title, setTitle] = useState('')
  const { createNewList } = useAuth()

  const handleCreation = async () => {

    if (!title) return toast.error('Please enter a title for the list') // we need a title for the list

    const listData = {
      title: title,
      emoji: emoji
    } // we need to pass this data to the createNewList function

    try { // we try to create the list
      createNewList(listData)
      setTitle('')
      setEmoji('💪')
      setDialogOpen(false)
    } catch (error) { // if we get an error we show it to the user. as a string, of course. Thanks TypeScript! 
      toast.error(error as string)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}> 
      <DialogTrigger asChild>
        <Button variant='secondary' className='w-full'>Create New List</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Enter the details below to create a new list, dont worry you will add items to it later.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center relative'>
            <div className={`absolute top-10 left-0 z-10 bg-white rounded-3xl ${open ? 'block' : 'hidden'}`}>
              <EmojiPicker onEmojiClick={(emoji) => {setEmoji(emoji.emoji);setOpen(false)}} theme={Theme.LIGHT} emojiVersion='' height={400} emojiStyle={EmojiStyle.NATIVE} />
            </div>
          
            <span className='text-base h-full flex items-center px-3 rounded-l-md border-l border-t border-b border-input bg-secondary hover:cursor-pointer' onClick={() => setOpen(!open)}>{emoji}</span>
            <Input id='title' type='text' placeholder='Workout Goals' required className='rounded-l-none' onChange={(e) => setTitle(e.target.value)} value={title} />
          </div>

          <Button type='button' className='w-full' onClick={handleCreation}>Create List</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
