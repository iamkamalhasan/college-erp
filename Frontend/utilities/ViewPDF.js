import { useEffect, useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import axios from '../axios.config';

import Button from './Button'

export default function ViewPDF( { studentId, semester, disabled } ) {

    const [ flag, setFlag ] = useState(false)
    const [ flag1, setFlag1 ] = useState(false)
    const [ data, setData ] = useState(null)
    
    useEffect(() => {
        
        if(flag) {        
        
            axios.get('/hod/studentHallTicket', { params : { studentId, semester }} )
            .then(response => {
                setData(response.data)
                setFlag1(true)
            })
            .catch(err => console.log(err.message))
            
            setFlag(false)
        }
        
    },[flag])

    useEffect(() => {

        if(flag1) {
            generate()
        }
    
    }, [data])

    
    const generate = async () => {

        // Create a new PDF document
        const url = '/hod/filesend'
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        const pages = pdfDoc.getPages()

        // Add some text to the PDF document
        pages[0].drawText(data.register.toString(), {
            x: 100,
            y: 749,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[0].drawText(data.register.toString(), {
            x: 106,
            y: 323,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[0].drawText(data.name.toString(), {
            x: 100,
            y: 724,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[0].drawText(data.name.toString(), {
            x: 72,
            y: 300,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[0].drawText(data.branch.toString(), {
            x: 365,
            y: 749,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[0].drawText(data.branch.toString(), {
            x: 340,
            y: 323,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[0].drawText(data.course.toString(), {
            x: 154,
            y: 276,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[0].drawText(data.current.toString(), {
            x: 430,
            y: 300,
            size: 10,
            color: rgb(0, 0, 0),
        });
        
        pages[0].drawText(data.arrear.toString(), {
            x: 430,
            y: 276,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[0].drawText(data.period.toString(), {
            x: 365,
            y: 724,
            size: 10,
            color: rgb(0, 0, 0),
        });

        for(let item of data.courseList) {
            console.log("sem",item.sem)
            const x = 29.5 + (item.sem-1)*68.5;
            for(let i=0;i<item.courseCodes.length;i++) {
                const y = 670 - (i*22.5)
                pages[0].drawText(item.courseCodes[i], {
                    x: x,
                    y: y,
                    size: 10,
                    color: rgb(0, 0, 0),
                });    
            }
            
        } 

        pages[0].drawText(data.fee1.toString(), {
            x:480,
            y: 230,
            size: 10,
            color: rgb(0, 0, 0),
        })

        pages[0].drawText(data.fee2.toString(), {
            x: 480,
            y: 210,
            size: 10,
            color: rgb(0, 0, 0),
        })
        
        pages[0].drawText(data.fee3.toString(), {
            x: 480,
            y: 190,
            size: 10,
            color: rgb(0, 0, 0),
        })
        
        pages[0].drawText(data.fee4.toString(), {
            x: 480,
            y: 170,
            size: 10,
            color: rgb(0, 0, 0),
        })

        pages[0].drawText(data.fee5.toString(), {
            x: 480,
            y: 150,
            size: 10,
            color: rgb(0, 0, 0),
        })

        pages[0].drawText(data.fee6.toString(), {
            x: 480,
            y: 120,
            size: 10,
            color: rgb(0, 0, 0),
        })

        pages[0].drawText(data.total.toString(), {
            x: 480,
            y: 100,
            size: 10,
            color: rgb(0, 0, 0),
        })

        pages[1].drawText(data.register.toString(), {
            x: 180,
            y: 284,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.name.toString(), {
            x: 180,
            y: 257,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.tAddr.substring(0,38), {
            x: 68,
            y: 190,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.tAddr.substring(38,70), {
            x: 68,
            y: 170,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.tAddr.substring(70,), {
            x: 68,
            y: 150,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.tPin.toString(), {
            x: 118,
            y: 130,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.pAddr.substring(0,38), {
            x: 310,
            y: 190,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.pAddr.substring(38,70), {
            x: 310,
            y: 170,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.pAddr.substring(70,), {
            x: 310,
            y: 150,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.pPin.toString(), {
            x: 360,
            y: 130,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.ph.toString(), {
            x: 118,
            y: 25,
            size: 10,
            color: rgb(0, 0, 0),
        });

        pages[1].drawText(data.mobile.toString(), {
            x: 450,
            y: 25,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Save the PDF document as a file
        const pdfBytes = await pdfDoc.save();
        // const fileName = data.name + '.pdf';
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const docUrl = URL.createObjectURL( blob );
        window.open(docUrl);
        // saveAs(blob, fileName);

    }

    return (
        <div>
            <Button event={() => {setFlag(true)}} icon="visibility" color='blue' name='view' disabled={disabled} />
        </div>
    )

}