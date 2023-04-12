import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

import { useContext, useEffect, useRef, useState } from 'react';
import { LoadingContext } from '../loading/loadingContext.js';

function Step2Create({ handleComplete, handleStart, canvasRef }) {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  //TODO: TypeSelected to be an ENUM - memory or ghost.
  const [typeSelected, setTypeSelected] = useState('memory');
  const [bodyPixModel, setBodyPixModel] = useState(null);
  const [imgGhostDataURL, setImgGhostDataURL] = useState(null);
  const imgRef = useRef(null);

  /* Init */
  useEffect(() => {
    const bodyPixProperties = {
      //MobileNetV1
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 4
      //ResNet50
      /*architecture: 'ResNet50',
      outputStride: 16,
      quantBytes: 4*/
    };

    bodyPix.load(bodyPixProperties).then((loadedModel) => {
      setBodyPixModel(loadedModel);
    });

    imgRef.current.src = canvasRef.current.toDataURL();
  }, []);

  function handleCreateMemory() {
    setTypeSelected('memory');

    imgRef.current.src = canvasRef.current.toDataURL();
  }

//Great code, just what I needed! The only thing I changed was that bound.bottom and bound.right both need incrementing by one after the loop, or the bottom-most and right-most rows of pixels get trimmed off.
//https://gist.github.com/remy/784508

  function trimImage(context, width, height) {
    let contextCopy = document.createElement('canvas').getContext('2d');
    let pixels = context.getImageData(0, 0, width, height);
    let pixelsLength = pixels.data.length;
    let i = 0;
    let bound = {
      top: null,
      left: null,
      right: null,
      bottom: null
    };
    let x = 0;
    let y = 0;

    for (i = 0; i < pixelsLength; i += 4) {
      if (pixels.data[i+3] !== 0) {
        x = (i / 4) % width;
        y = ~~((i / 4) / width);
  
        if (bound.top === null) {
          bound.top = y;
        }
        
        if (bound.left === null) {
          bound.left = x; 
        } else if (x < bound.left) {
          bound.left = x;
        }
        
        if (bound.right === null) {
          bound.right = x; 
        } else if (bound.right < x) {
          bound.right = x;
        }
        
        if (bound.bottom === null) {
          bound.bottom = y;
        } else if (bound.bottom < y) {
          bound.bottom = y;
        }
      }
    }
    
    let trimHeight = bound.bottom - bound.top;
    let trimWidth = bound.right - bound.left;

    if ((trimHeight < 5) || (trimWidth < 5)) {
      return null;
    }

    let trimmed = context.getImageData(bound.left, bound.top, trimWidth, trimHeight);
  
    contextCopy.canvas.width = trimWidth;
    contextCopy.canvas.height = trimHeight;
    contextCopy.putImageData(trimmed, 0, 0);
  
    return contextCopy.canvas;
  }

  /* Create Ghost */
  function handleCreateGhost() {
  	setTypeSelected('ghost');

    // Already been done.
    if (imgGhostDataURL) {
      imgRef.current.src = imgGhostDataURL;
      return;
    }

    // Not loaded.
   	if (isLoading || !bodyPixModel) {
      return;
  	}

    const setLoading = async () => {
      return new Promise((res) => {
        setIsLoading(true);
        setTimeout(res, 1000);
      });
    }

    // Show loading before starting other Promise.
  	setLoading().then(() => {
      const canvas = canvasRef.current;
      const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const { data:imgData } = context.getImageData(0,
                                                    0,
                                                    canvasWidth,
                                                    canvasHeight);

      const ghostImg = context.createImageData(canvasWidth, canvasHeight);
      const ghostImgData = ghostImg.data;

      const runSegmentPerson = async () => {
        return await bodyPixModel.segmentPerson(canvasRef.current, segmentationProperties);
      }

      const segmentationProperties = {
        //MobileNetV1
        flipHorizontal: false,
        internalResolution: 'high',
        segmentationThreshold: 0.7
        //ResNet50
        /*internalResolution: "full",
        segmentationThreshold: 0.2,
        nmsRadius: 1*/
      };

      runSegmentPerson().then(({ data:map }) => {
        // Data array stores four values for each pixel.
        for (let i=0; i < map.length; i++) {
          const [r, g, b, a] = [imgData[i*4], imgData[i*4+1], imgData[i*4+2], imgData[i*4+3]];
          [
            ghostImgData[i*4],
            ghostImgData[i*4+1],
            ghostImgData[i*4+2],
            ghostImgData[i*4+3]
          ] = !map[i] ? [255, 255, 255, 0] : [r, g, b, a];
        }

        let canvasCopy = document.createElement('canvas');
        let contextCopy = canvasCopy.getContext('2d', { willReadFrequently: true });
        contextCopy.canvas.width = canvasWidth;
        contextCopy.canvas.height = canvasHeight;
        contextCopy.putImageData(ghostImg, 0, 0);

        canvasCopy = trimImage(contextCopy, canvasWidth, canvasHeight);

        // Handle error where there is no one to trim!
        if (!canvasCopy) {
          alert('I couldn\'t find a person in the picture to turn into a Ghost');
          setIsLoading(false);

          handleCreateMemory()

          return;
        }

        imgRef.current.src = canvasCopy.toDataURL();
        setImgGhostDataURL(imgRef.current.src);

        setIsLoading(false);
      });
    });
  }

  function handleCreateComplete() {
    handleComplete(imgRef.current.src);
  }

  return (
    <div className={`create ${typeSelected}`}>
      <button class="memory" onClick={handleCreateMemory}>Create Memory</button> Frame your Echo as a memory
      <br /> 
      <button class="ghost" onClick={handleCreateGhost}>Create Haunt</button> Turn your Echo into a Ghost!
      <br />
      <br />
      <button onClick={handleCreateComplete}>I'm Happy. Let's drop my Echo.</button>
      <br />
      <button onClick={handleStart}>Back</button>
      <br />
      <br />
      <img ref={imgRef} />
    </div>
  );
}

export default Step2Create;
