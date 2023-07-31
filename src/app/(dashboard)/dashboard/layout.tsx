import FriendRequestSidebarOptions from '@/components/FriendRequestSidebarOptions'
import SidebarChatList from '@/components/SidebarChatList'
import { Icons } from '@/components/Icons'
import SignOutButton from '@/components/SignOutButton'
import { getFriendsByUserId } from '@/helpers/get-friends-by-users-id'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { SidebarOption } from '@/types/typings'
import MobileChatLayout from '@/components/MobileChatLayout'

interface LayoutProps {
  children: ReactNode
}

const sidebarOptions: SidebarOption[] = [
    {
        id: 1,
        name: 'Add Friend',
        href: '/dashboard/add',
        Icon: 'UserPlus'
    },
]

const Layout = async ({children}: LayoutProps) => {

    const session = await getServerSession(authOptions)
    if (!session) {
        notFound()
    }

    const friends = await getFriendsByUserId(session.user.id)

    const unseenRequestCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as User[]).length

  return (
    <div className='w-full flex h-screen'>
        <div className='md:hidden'>
            <MobileChatLayout friends={friends} session={session} sidebarOptions={sidebarOptions} unseenRequestCount={unseenRequestCount} />
        </div>
        <div className='hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-300 bg-white px-6'>
            <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
                <Icons.Logo className='h-8 w-auto text-stone-600 mr-12' />
                <p className='text-lg font-bold'>LetsChat</p>
            </Link>
            
            <nav className='flex flex-1 flex-col'>
                <ul role='list' className='flex flex-1 flex-col gap-y-5'>
                    <li>
                        {friends.length > 0 ? (
                            <div className='text-sm font-semibold leading-6 text-gray-400'>
                                Your Chats
                            </div>
                        ) : null}
                        <SidebarChatList friends={friends} sessionId={session.user.id} />
                    </li>

                    <li>
                        <div className='text-sm font-semibold leading-6 text-gray-400'>
                            Overview
                        </div>

                        <ul role='list' className='-mx-2 mt-2 space-y-1'>
                            {sidebarOptions.map((option) => {
                                const Icon = Icons[option.Icon]
                                return (
                                    <li key={option.id}>
                                        <Link href={option.href} className='text-gray-800 hover:text-sky-700 hover:bg-gray-200 group flex gap-3 rounded-md p-2 leading-6 font-semibold'>
                                            <span className='text-gray-500 border-gray-500 group-hover:border-sky-700 group-hover:text-sky-700 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
                                                <Icon className='h-4 w-4' />
                                            </span>

                                            <span className='truncate'>{option.name}</span>
                                        </Link>
                                    </li>
                                )
                            })}

                            <li>
                                <FriendRequestSidebarOptions sessionId={session.user.id} initialUnseenRequestCount={unseenRequestCount} />
                            </li>
                        </ul>
                    </li>

                    <li className='-mx-6 mt-auto flex items-center'>
                        <div className='flex flex-1 items-center gap-x-4 px-4 py-3 text-sm font-semibold leading-6 text-gray-900 max-w-xs'>
                            <div className='relative h-8 w-8 bg-gray-50'>
                                <Image 
                                    fill
                                    referrerPolicy='no-referrer'
                                    className='rounded-full'
                                    src={session.user.image || ''}
                                    alt={'Your profile picture'}
                                />
                            </div>

                            <span className='sr-only'>Your Profile</span>

                            <div className='flex flex-col max-w-[180px]'>
                                <span aria-hidden='true'>{session.user.name}</span>
                                <span className='text-xs text-zinc-400 truncate block' aria-hidden='true'>
                                    {session.user.email}
                                </span>
                            </div>

                            <SignOutButton className='h-full aspect-square' />
                        </div>
                    </li>
                </ul>
            </nav>
        </div>

        <aside className='max-h-screen container py-16 md:py-12 w-full'>
            {children}
        </aside>
    </div>
  )
}

export default Layout