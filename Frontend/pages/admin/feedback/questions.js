import {useState} from 'react'
import Upload from '../../../utilities/Upload'
import initial from "../../../utilities/initial.json"

const fb_generate=()=>{ 
    const [modalOpen, setModalOpen] = useState(false);

    return (
      <div >
       
     <div className='p-4'>
                 
        <Upload path={'/admin/feedback/questions/upload'} template={initial.feedback} context={"feedback"}/>
               
  </div>
  
        {modalOpen && <Modal setOpenModal={setModalOpen} />}
      </div>
    );
  }
  
export default fb_generate



