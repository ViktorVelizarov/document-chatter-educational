//import ChatWrapper from '@/components/chat/ChatWrapper'
import PdfRenderer from '@/components/PdfRenderer'
import { db } from '@/db'
//import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation'

interface PageProps {  //type for the params we receive 
  params: {
    fileid: string
  }
}

const Page = async ({ params }: PageProps) => { //nextjs automaticly sends the url parameters as params
  const { fileid } = params // the fileid in the url of the page

  const { getUser } = getKindeServerSession()
  const user = getUser()

  if (!user || !user.id) //if user is not logged in send them to auth-callback
    redirect(`/auth-callback?origin=dashboard/${fileid}`)

  const file = await db.file.findFirst({ //make db call to get the current file
    where: {
      id: fileid, //get current file
      userId: user.id, //a user can only edit his own files
    },
  })

  if (!file) notFound() //in case there is no file throw a 404

  //const plan = await getUserSubscriptionPlan()

  return (
    <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
        {/* Left sidebar & main wrapper */}
        <div className='flex-1 xl:flex'>
          <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
            {/* Main area */}
            <PdfRenderer url={file.url} />
          </div>
        </div>

       
      </div>
    </div>
  )
}

export default Page
