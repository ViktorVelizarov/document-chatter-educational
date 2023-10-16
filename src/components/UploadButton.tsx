'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'

import Dropzone from 'react-dropzone' //npm install react-dropzone
import { Cloud, File, Loader2 } from 'lucide-react'
import { Progress } from './ui/progress'
import { useUploadThing } from '@/lib/uploadthing'
import { useToast } from './ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import { useRouter } from 'next/navigation'

const UploadDropzone = ({ //component that handles the drag and drop
  isSubscribed,
}: {
  isSubscribed: boolean
}) => {
  const router = useRouter()

  const [isUploading, setIsUploading] = //state for loading animation 
    useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = //tracking the upload file progress so we can redirect the user when its at 100
    useState<number>(0)
  const { toast } = useToast() // function from shadcn to make toast notifications


  const { startUpload } = useUploadThing('pdfUploader') 

  //also since our normal upload progress state doesnt give us a % from 0 to a 100 but just gives us a sign when it gets to a 100
  //we are going to use something called "determiante progress bar" which means
  //we are going to increase the bar by 5% in a interval and when we get the sign its ready
  //we skip ahead to a 100%, but if we don't get the sign in time the bar freezer at 95% until we get the sign


  const { mutate: startPolling } = trpc.getFile.useMutation(
    {
      onSuccess: (file) => {  //if the file exist in DB
        router.push(`/dashboard/${file.id}`)
      },
      retry: true,   //retry to find file in DB unitl true
      retryDelay: 500,
    }
  )

  const startSimulatedProgress = () => { //here we start the simulated progress bar 
    setUploadProgress(0) //start from 0

    const interval = setInterval(() => { //run the code every 0.5 sec
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval) // if we get to 95 we invalidate the interval so we dont progress further
          return prevProgress
        }
        return prevProgress + 5 //else increase by 5 for each 0.5 sec
      })
    }, 500)

    return interval
  }

  return (
    <Dropzone  
      multiple={false} //we want to drop only 1 file
      onDrop={async (acceptedFile) => {
        setIsUploading(true) //when a file is dropped we start the uploading bar

        const progressInterval = startSimulatedProgress() // start bar

        // handle file uploading
        const res = await startUpload(acceptedFile)

        if (!res) {
          return toast({   //make a toast notification if there is an error
            title: 'Something went wrong',
            description: 'Please try again later',
            variant: 'destructive',
          })
        }

        const [fileResponse] = res
        const key = fileResponse?.key

        if (!key) {  //also checking if the file has a key because this is essential
          return toast({
            title: 'Something went wrong',
            description: 'Please try again later',
            variant: 'destructive',
          })
        }

        //after the file is done uploading we stop the +5 interval and set the bar to 100
        clearInterval(progressInterval)
        setUploadProgress(100)

        startPolling({ key })// check if file exists in DB and then redirect
      }}>
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
          <div className='flex items-center justify-center h-full w-full'>
            <label
              htmlFor='dropzone-file'
              className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                <Cloud className='h-6 w-6 text-zinc-500 mb-2' />
                <p className='mb-2 text-sm text-zinc-700'>
                  <span className='font-semibold'>
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className='text-xs text-zinc-500'>
                  PDF (up to {isSubscribed ? "16" : "4"}MB)
                </p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? ( //triggers when the file is dropped
                <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                  <div className='px-3 py-2 h-full grid place-items-center'>
                    <File className='h-4 w-4 text-blue-500' />
                  </div>
                  <div className='px-3 py-2 h-full text-sm truncate'>
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (  // check loading state
                <div className='w-full mt-4 max-w-xs mx-auto'>
                  <Progress
                    value={uploadProgress}
                    className='h-1 w-full bg-zinc-200'
                  />
                  {uploadProgress === 100 ? (
                    <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                      <Loader2 className='h-3 w-3 animate-spin' />
                      Redirecting...
                    </div>
                  ) : null}
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type='file'
                id='dropzone-file'
                className='hidden'
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
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
        <UploadDropzone isSubscribed={true} />   
      </DialogContent>
    </Dialog>
  )
}

export default UploadButton
