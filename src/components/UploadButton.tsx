'use client'
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog"
import React from "react"   
import { Button } from "./ui/button"
import { DialogContent } from "./ui/dialog"
const UploadButton = () => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false)

    return(
        <Dialog
        open={isOpen}
        onOpenChange={(v) => {
          if (!v) {
            setIsOpen(v)
          }
        }}>
        <DialogTrigger
          onClick={() => setIsOpen(true)}
          asChild>
          <Button>Upload PDF</Button>
        </DialogTrigger>
  
        <DialogContent>
          example
        </DialogContent>
      </Dialog>
    )
}

export default UploadButton