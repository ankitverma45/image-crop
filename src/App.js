import React , {useEffect, useState} from 'react';
import ReactCrop ,{ centerCrop, makeAspectCrop }from 'react-image-crop';
import { useDropzone } from "react-dropzone"

function App() {

  const [files,setFiles]=useState([])
  const [isCrop, setIsCrop] = useState({aspect:12/10});
  const [image, setImage] = useState(null);

  const {getRootProps,getInputProps,fileRejections}=useDropzone({
    accept:{
      "image/jpeg":[],
      "image/png":[],
    },
    onDrop:acceptedFiles=>{
      setFiles(acceptedFiles.map(file=>Object.assign(file,{
        preview:URL.createObjectURL(file)
      })))
    }
  })
  const onImageLoaded = (file, width, height) => {
        URL.revokeObjectURL(file.preview)
        setIsCrop(centerCrop(makeAspectCrop({ unit: '%', width: 50, height: 50 }, 1, width, height), width, height))
      }
  


  const onCropComplete = () => {
    const canvas = document.createElement('canvas');
    const scaleX = files[0].naturalWidth / files[0].width;
    const scaleY = files[0].naturalHeight / files[0].height;
    canvas.width = isCrop.width;
    canvas.height = isCrop.height;
    const ctx = canvas.getContext('2d');

    const pixelRatio = window.devicePixelRatio;
    canvas.width = isCrop.width * pixelRatio;
    canvas.height = isCrop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

   
    ctx.drawImage(
      image,
      isCrop.x * scaleX,
      isCrop.y * scaleY,
      isCrop.width * scaleX,
      isCrop.height * scaleY,
      0,
      0,
      isCrop.width,
      isCrop.height,
    );
  
    // Converting to base64
    const base64Image = canvas.toDataURL('image/jpeg');
    console.log('base64Image => ', base64Image)
    setImage(base64Image)
  }



  useEffect(()=>{
    setImage(files[0])
    return ()=>
    files.forEach(file=>URL.revokeObjectURL(file.preview))
  },[files]);

  return (
     <section className='container'>
      <div {...getRootProps({className:"dropzone"})}>
        <input {...getInputProps()} />
        {files && files.length <= 0 && (
          <>
           <p>Drag 'n' drop some files here, or click to select files</p>
          {fileRejections && fileRejections.length <= 0 ? null :
              (<span className="invalid-feedback d-block">File type is Not Supported</span>)}
              </>)}
      </div>
      {files && files.length > 0 &&
        <ReactCrop crop={isCrop} onChange={(_, percentCrop) => { setIsCrop(percentCrop) }}
         onImageLoaded={() => setImage(files[0])} aspect={1} locked={false} onComplete={() => onCropComplete()}>
         <img src={files[0].preview} alt="preview"  onLoad={({ currentTarget: { width, height } }) => onImageLoaded(files[0], width, height)} />   
         </ReactCrop>
     }
     </section>
  )

}

export default App;
