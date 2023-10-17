'use client' //the pdf worker works only on client side

import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'

import 'react-pdf/dist/Page/AnnotationLayer.css' //copied from thereact-pdf website. Makes pdf look better
import 'react-pdf/dist/Page/TextLayer.css' //this one also
import { useToast } from './ui/use-toast'
import { Button } from './ui/button'
import { Input } from './ui/input' //npx shadcn-ui@latest add input
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod' // npm install @hookform/resolvers
import { cn } from '@/lib/utils'
import { useResizeDetector } from 'react-resize-detector'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import SimpleBar from 'simplebar-react'

//this is a "worker" we need to be able to render pdf files
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRendererProps {
    url: string
  }

const PdfRenderer = ({ url }: PdfRendererProps) => {
    
    const [numPages, setNumPages] = useState<number>() //number of pages
    const [currPage, setCurrPage] = useState<number>(1) //current page
    const [scale, setScale] = useState<number>(1)      //zoom page %
    const { toast } = useToast()

    const handlePageSubmit = ({ //handle Enter press on input
      page,
    }: TCustomPageValidator) => {
      setCurrPage(Number(page))      //set doc page
      setValue('page', String(page)) //set input value
    }

     // we get the width of the element with "ref" saved in this state
    const { width, ref } = useResizeDetector() //npm install react-resize-detector
    
    const CustomPageValidator = z.object({ //we use this to validate if the input for page is a valid input
      page: z
        .string()
        .refine(
          (num) => Number(num) > 0 && Number(num) <= numPages!
        ),
    })

    type TCustomPageValidator = z.infer<   //geet the type of the validator above
    typeof CustomPageValidator>

    const {
      register,
      handleSubmit,
      formState: { errors },   //handle errors
      setValue,                //sync input with the current page
    } = useForm<TCustomPageValidator>({
      defaultValues: {
        page: '1',
      },
      resolver: zodResolver(CustomPageValidator),
    })
    
    return (
        <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
        <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
        <div className='flex items-center gap-1.5'>
          <Button  //previous page btn
            disabled={currPage <= 1}  //if we are on the first page the button is disabled
            onClick={() => {
              setCurrPage((prev) => // increase currPage + 1 onClick
                prev - 1 > 1 ? prev - 1 : 1
              )
              setValue('page', String(currPage - 1))
            }}
            variant='ghost'
            aria-label='previous page'>
            <ChevronDown className='h-4 w-4' />
          </Button>

          <div className='flex items-center gap-1.5'>
            <Input  //input to choose current page
              {...register('page')}  //first checking if the input is correct
              className={cn(
                'w-12 h-8',
                errors.page && 'focus-visible:ring-red-500' //if we have errors for "page" input hten show red
              )}
              onKeyDown={(e) => {  //when you press enter in the input call handlePageSub
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)()
                }
              }}
            />
            <p className='text-zinc-700 text-sm space-x-1'>    {/* showing the total num of pages*/}
              <span>/</span> 
              <span>{numPages ?? 'x'}</span>  
            </p>
          </div>

          <Button    //next page button
            disabled={
              numPages === undefined ||
              currPage === numPages
            }
            onClick={() => {
              setCurrPage((prev) => //increase currPage + 1 on click
                prev + 1 > numPages! ? numPages! : prev + 1
              )
              setValue('page', String(currPage + 1))
            }}
            variant='ghost'
            aria-label='next page'>
            <ChevronUp className='h-4 w-4' />
          </Button>
        </div>

        <div className='space-x-2'>
          <DropdownMenu>      
            <DropdownMenuTrigger asChild>
              <Button
                className='gap-1.5'
                aria-label='zoom'
                variant='ghost'>
                <Search className='h-4 w-4' />
                {scale * 100}%
                <ChevronDown className='h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>   
        </div>   

        <div className='flex-1 w-full max-h-screen'>
          <SimpleBar
          autoHide={false}
          className='max-h-[calc(100vh-10rem)]'>
            <div ref={ref}>
                <Document        //from react-pdf lib 
                loading={    //loading animation 
                    <div className='flex justify-center'>
                    <Loader2 className='my-24 h-6 w-6 animate-spin' />
                    </div>
                }
                onLoadError={() => { //if there is an error
                    toast({
                    title: 'Error loading PDF',
                    description: 'Please try again later',
                    variant: 'destructive',
                    })
                }}
                onLoadSuccess={({ numPages }) =>  //when the pdf loads
                setNumPages(numPages)     //get the number of pdf pages
                }
                file={url} className='max-h-full'>   
                    <Page width={width ? width : 1} // it has the width from the state 
                    pageNumber={1}
                    scale={scale}/>
                </Document>   
            </div>
            </SimpleBar>
        </div>
        </div>
    )
}

export default PdfRenderer 
