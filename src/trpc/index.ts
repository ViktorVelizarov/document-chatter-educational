import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import {
  privateProcedure,
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
   //we create a authCallback API endpoint of type publicProcedure which means anybody can call it regardless 
  //of if they are logged in or not. Then we use a query beacuse we use a GET req to our DB to see 
  //if the user is in the DB or not
  authCallback: publicProcedure.query(async () => {  //GET req because of .query
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


  //this API endpoint is used to get back all the user files for a user with the passed id
  getUserFiles: privateProcedure.query(async ({ ctx }) => {   //The .query is for GET req
    const { userId } = ctx  // we access the data sent from trpc.ts

    return await db.file.findMany({ //we return all files for the current user
      where: {
        userId,
      },
    })
  }),

  //api endpoint for deleting a selected  file from dashbooard, this is also a POST req because .mutation is used for mutating/changind data.
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() })) //whenever we call the API endpoint the zod
                                         // library makes us pass an object with id string
                                         //that means taht zod enforces TypeScript at runtime, since normal TS runs only at build time
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          id: input.id,  //the file has to have the passsed ID from the API call
          userId,        //and for extea security we also check if the current user owns the file
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' }) //if the user doesnt have files yet

      await db.file.delete({  //deleting the file
        where: {
          id: input.id,
        },
      })

      return file  //this return does nothing
    }),

});
 
export type AppRouter = typeof appRouter;