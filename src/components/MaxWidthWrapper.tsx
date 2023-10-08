//this is a reusable comp we use to make sure the spacing on the left and right side 
// is the same on all pages of our app

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const MaxWidthWrapper = ({
    className,
    children,
  }: {
    className?: string   // ? means its not mandatory
    children: ReactNode  //tipe for React children
  }) => {
    return (
      <div className={cn('mx-auto w-full max-w-screen-xl px-2.5 md:px-20', className)}>  
        {children}
      </div>
    )
  }
  
export default MaxWidthWrapper
  