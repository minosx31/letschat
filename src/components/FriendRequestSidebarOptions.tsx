'use client'

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

interface FriendRequestSidebarOptionsProps {
    sessionId: string
    initialUnseenRequestCount: number
}

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({ sessionId, initialUnseenRequestCount }) => {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests}`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const friendRequestHandler = () => {
            setUnseenRequestCount((prev) => prev + 1)
        }

        const addedFriendHandler = () => {
            setUnseenRequestCount((prev) => prev - 1)
        }
        
        pusherClient.bind('incoming_friend_requests', friendRequestHandler)
        pusherClient.bind('new_friend', addedFriendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)

            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
            pusherClient.unbind('new_friend', addedFriendHandler)
        }
    }, [sessionId])

  return <Link href='/dashboard/requests' className='text-gray-800 hover:text-sky-700 hover:bg-gray-200 group flex items-center gap-3 rounded-md p-2 leading-6 font-semibold'>
    <div className='text-gray-500 border-gray-500 group-hover:border-sky-700 group-hover:text-sky-700 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
        <User className='h-4 w-4' />
    </div>

    <p className='truncate'>Friend Requests</p>

    {unseenRequestCount > 0 ? (
        <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-sky-800'>{unseenRequestCount}</div>
    ) : null}

  </Link>
}

export default FriendRequestSidebarOptions