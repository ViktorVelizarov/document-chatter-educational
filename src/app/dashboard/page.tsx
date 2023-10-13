//server component for /dashboard

//import Dashboard from '@/components/Dashboard'
import { db } from '@/db'
//import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'

const Page = async () => {
  const { getUser } = getKindeServerSession()  //get current user
  const user = getUser()

  if (!user || !user.id) redirect('/auth-callback?origin=dashboard') //if user tries to acces 
  //dashboard without login we will send them to log in and then back to this page by using the 
  //parameter origin

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  })

  if(!dbUser) redirect('/auth-callback?origin=dashboard')

  //const subscriptionPlan = await getUserSubscriptionPlan()

  return <div>{user.email}</div>
}

export default Page
