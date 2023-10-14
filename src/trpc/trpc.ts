import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError, initTRPC } from '@trpc/server';
 

const t = initTRPC.create();
 const middleware = t.middleware

const isAuth = middleware(async (opts) => {   //here we check if the user is authenticated
    const { getUser } = getKindeServerSession()
    const user = getUser()
  
    if (!user || !user.id) {  //if not throw an error
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
  
    return opts.next({  //whatever we pass from here will be accessable in the API endpoint we call this from so in this case getUserFiles
      ctx: { 
        userId: user.id,
        user,
      },
    })
  })

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth) // before the privateP API endpoint is called
                                                        // the program has to run the isAuth function
                                                        // and check if user is logged, if yes it sends the userID to the API endpoint, if no it throws an error