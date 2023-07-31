'use client'

import { FC, useState } from 'react'
import Button from './ui/Button'
import { addFriendValidator } from '@/lib/validations/add-friend'
import axios, { AxiosError } from 'axios'
import { ZodError, set, z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'

interface AddFriendButtonProps {
  
}

type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
    const [showSuccessState, setShowSuccessState] = useState<boolean>(false)

    const {
        register, reset, handleSubmit
    } = useForm<FormData>({
        resolver: zodResolver(addFriendValidator)
    })

    const addFriend = async (email: string) => {
        try {
            // validate email input
            const validatedEmail = addFriendValidator.parse({ email })
            await axios.post('/api/friends/add', {
                email: validatedEmail,
            })

            setShowSuccessState(true)
            reset()
            toast.success("Friend request sent!")
        } catch (error) {
            if (error instanceof z.ZodError) {
                toast.error(error.message)
                return
            }

            if (error instanceof AxiosError) {
                toast.error(error.response?.data)
                return
            }
            toast.error("Something went wrong!")
        }
    }

    const onSubmit = (data: FormData) => {
        addFriend(data.email)
    }

  return <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
    <label htmlFor='email' className='block text-sm font-medium leading-6 text-gray-900'>
        Add friend by email
    </label>

    <div className='mt-2 flex gap-4'>
        <input 
            {...register('email')}
            type='text' className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6' placeholder='example@example.com' />
        <Button>Add</Button>
    </div>

  </form>
}

export default AddFriendButton