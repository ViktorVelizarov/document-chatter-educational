//this page is used to sync in the logged user with the database in case they are logging
//for the first time. If they have logged before then they are already synced

"use client" // trpc is a client side library and we also use hooks

import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

const Page = () => {
  const router = useRouter() //we have to do this to get access to searchParameters

  const searchParams = useSearchParams() // here we get the origin parameter we passed in dashboard
  const origin = searchParams.get('origin') // getting origin param


   // this  query runs every time the authCallback page is laoded
  trpc.authCallback.useQuery(undefined, {   //we use undefined first because we dont expect any data sent back like a POST req
    onSuccess: ({ success }) => {     
      if (success) {
        // user is synced to db
        router.push(origin ? `/${origin}` : '/dashboard') //send the user back to the origin url
      }
    },
    onError: (err) => {
      if (err.data?.code === 'UNAUTHORIZED') {
        router.push('/sign-in')
      }
    },
    retry: true,
    retryDelay: 500,
  })

  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
        <h3 className='font-semibold text-xl'>
          Setting up your account...
        </h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}

export default Page
