import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import {
  //privateProcedure,
  publicProcedure,
  router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import { db } from '@/db'
import { z } from 'zod'
//import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
//import { absoluteUrl } from '@/lib/utils'
//import {
////  getUserSubscriptionPlan,
//  stripe,
//} from '@/lib/stripe'
//import { PLANS } from '@/config/stripe'

export const appRouter = router({
   //we create a authCallback API of type publicProcedure which means anybody can call it regardless 
  //of if they are logged in or not. Then we use a query beacuse we use a GET req to our DB to see 
  //if the user is in the DB or not
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession()
    const user = getUser()

    if (!user.id || !user.email)  //if user not logged in
      throw new TRPCError({ code: 'UNAUTHORIZED' })


    // check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    })

    if (!dbUser) {  // if the user in not in the db
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    }

    return { success: true }  //returned after user is added in db or if he was there in the first place
  }),
});
 
export type AppRouter = typeof appRouter;