'use client' //the pdf worker works only on client side

import { Document, Page, pdfjs } from 'react-pdf'

import 'react-pdf/dist/Page/AnnotationLayer.css' //copied from thereact-pdf website. Makes pdf look better
import 'react-pdf/dist/Page/TextLayer.css' //this one also

//this is a "worker" we need to be able to render pdf files
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRendererProps {
    url: string
  }

const PdfRenderer = ({ url }: PdfRendererProps) => {
    return (
        <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
        <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
          <div className='flex items-center gap-1.5'>
            top bar
            </div>
        </div>   

        <div className='flex-1 w-full max-h-screen'>
            <Document file={url} className='max-h-full'>
                <Page pageNumber={1}/>
            </Document>   
        </div>
        </div>
    )
}

export default PdfRenderer 