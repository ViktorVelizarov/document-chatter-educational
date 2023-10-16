//preparing the uploadthing library to be used in our project

//code pasted from uploadthing site

import { generateReactHelpers } from "@uploadthing/react/hooks";
 
import type { OurFileRouter } from "@/app/api/uploadthing/core";
 
export const { useUploadThing } =   //creating a useUploadThing hook that we use in UploadButton comp
  generateReactHelpers<OurFileRouter>();