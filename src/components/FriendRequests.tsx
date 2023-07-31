'use client'

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import axios from 'axios'
import { Check, User2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useState, useEffect} from 'react'

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({ incomingFriendRequests, sessionId }) => {
    const router = useRouter()

    const [ friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests)

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))

        const friendRequestHandler = ({senderId, senderEmail}: IncomingFriendRequest) => {
            setFriendRequests((prev) => [...prev,  { senderId, senderEmail }])
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
        }
    }, [sessionId])
    

    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friends/accept', { id: senderId })

        setFriendRequests((prevRequest) => prevRequest.filter((request) => request.senderId !== senderId))

        router.refresh()
    }

    const rejectFriend = async (senderId: string) => {
        await axios.post('/api/friends/reject', { id: senderId })

        setFriendRequests((prevRequest) => prevRequest.filter((request) => request.senderId !== senderId))

        router.refresh()
    }

  return (
    <>
        {friendRequests.length === 0 ? (
            <p className='text-sm text-zinc-500'>Nothing to show here...</p>
        ) : (
            friendRequests.map((request) => (
                <div key={request.senderId} className='flex gap-4 items-center'>
                    <div className="h-6 w-6 flex justify-center items-center text-black border border-black rounded-xl">
                        <User2 className='h-4 w-4' />
                    </div>
                    

                    <div className="flex-1 align-start">
                        <p className='font-medium text-lg'>{request.senderEmail}</p>
                    </div>
                    
                    <div className='flex flex-1 justify-start gap-2'>
                        <button onClick={() => acceptFriend(request.senderId)} aria-label='accept friend' className='w-8 h-8 bg-emerald-600 hover:bg-emerald-700 grid place-items-center rounded-full transition hover:shadow-md'>
                            <Check className='font-semibold text-white w-3/4 h-3/4' />
                        </button>
                        
                        <button onClick={() => rejectFriend(request.senderId)} aria-label='reject friend' className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'>
                            <X className='font-semibold text-white w-3/4 h-3/4' />
                        </button>
                    </div>
                    
                </div>
        ))
        )}
    </>
  )
}

export default FriendRequests