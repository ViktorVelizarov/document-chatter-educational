import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
 

export const ourFileRouter = {

  pdfUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => { //middleware runs before the file upload reqest
        const { getUser } = getKindeServerSession()
        const user = getUser()
      
        if (!user || !user.id) throw new Error('Unauthorized') //only authorized users can uplaod files
      
        //const subscriptionPlan = await getUserSubscriptionPlan()
        
        return {userId: user.id } //whatever we return here will be sent to .onUploadComplete as metadata prop
    
    })
    .onUploadComplete(async ({ metadata, file }) => {}), //onUploadComp runs when the uplaod is completted
} satisfies FileRouter;
  
export type OurFileRouter = typeof ourFileRouter;