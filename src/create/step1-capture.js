import {
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { LoadingContext } from '../loading/loadingContext.js';

function Step1Capture({ handleCaptureComplete, canvasRef }) {
  const {isLoading, setIsLoading} = useContext(LoadingContext);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [playerImageCapture, setPlayerImageCapture] = useState(null);
  const playerRef = useRef(null);

  let playerConstraints = {
    video: {
      /*width: {
        ideal: 1920,
      },
      height: {
        ideal: 1080,
      },*/
      facingMode: 'environment'
    },
    audio: false
  };

  // setHasMultipleCameras used by Flip to selfie. Removed functionality.
  /*useEffect(() => {
  	const fetchDevices = async () => {
      return await navigator.mediaDevices.enumerateDevices();
    }

    fetchDevices().then((devices) => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length > 1) {
        setHasMultipleCameras(true);
      }
    });
  }, []);*/

  /* Start Camera */
  function handleStartCamera() {
  	if (isLoading) {
      return;
  	}

    setIsLoading(true);
    navigator.mediaDevices.getUserMedia(playerConstraints).then((mediaStream) => {
      setIsCameraActive(true);

      playerRef.current.srcObject = mediaStream;

      const mediaStreamTrack = mediaStream.getVideoTracks()[0];
      setPlayerImageCapture(new ImageCapture(mediaStreamTrack));
    });

    playerRef.current.onloadeddata = () => {
      setIsLoading(false);
    };
  }

  /* Photo Upload */
  function handleFileChange(fileEvent) {
    if(fileEvent.target.files) {
      let file = fileEvent.target.files[0];
      var reader  = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function(readerEvent) {
        let image = new Image();
        image.src = readerEvent.target.result;
        image.onload = function(imageEvent) {
          canvasRef.current.width = image.width;
          canvasRef.current.height = image.height;
          canvasRef.current.getContext('2d').drawImage(image, 0, 0);

          handleCaptureComplete();
        }
      }
    }
  }

  function handleCameraTakeFallback() {
    setIsLoading(false);

    let context = canvasRef.current.getContext('2d');
    context.drawImage(playerRef.current,
                      0,
                      0,
                      playerRef.current.offsetWidth,
                      playerRef.current.offsetHeight);

    handleCameraClose();

    handleCaptureComplete();
  }

  /* Take Camera Photo */
  function handleCameraTake() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setIsCameraActive(false);

    if (!playerImageCapture) {
      handleCameraTakeFallback();

      return;
    }

    playerImageCapture.grabFrame().then((imageBitmap) => {
      setIsLoading(false);

      canvasRef.current.width = imageBitmap.width;
      canvasRef.current.height = imageBitmap.height;
      canvasRef.current.getContext('2d').drawImage(imageBitmap, 0, 0);

      handleCameraClose();

      handleCaptureComplete();
    }).catch((error) => {
      // TODO: Record Issue in Analytics.
      console.error("handleCameraTake() error: ", error);

      handleCameraTakeFallback()
    });
  }

  // Flip to selfie. Removed functionality.
  /*function handleCameraFlip() {
  	if (!hasMultipleCameras) {
  	  return;
  	}
    
    let facingModeChange = (facingMode === 'user') ? 'environment' : 'user';
    setFacingMode(facingModeChange);
    playerConstraints.video.facingMode = facingModeChange;

    playerRef.current.srcObject.getVideoTracks().forEach(track => track.stop());
    navigator.mediaDevices.getUserMedia(playerConstraints).then((stream) => {
      playerRef.current.srcObject = stream;
    });
  }*/

  function handleCameraClose() {
  	playerRef.current.srcObject.getVideoTracks().forEach(track => track.stop());
    setPlayerImageCapture(null);

    setIsCameraActive(false);
  }

  // Button for `'Flip to selfie'. Removed functionality.
  //{hasMultipleCameras && <button onClick={handleCameraFlip}>Flip</button>}

  return (
    <div className={`capture${isCameraActive ? ' video' : ''}`}>
      <div class="video">
        <video ref={playerRef} autoPlay></video>
        <div class="controls">
          <button onClick={handleCameraClose}>Close</button> &nbsp;
          <button onClick={handleCameraTake}>Take</button>
        </div>
      </div>
      <div class="buttons">
        Capture photo: <button onClick={handleStartCamera}>Take Picture</button>
        <br /><br />
        Upload from phone: <input type="file" accept="image/*;capture=camera" onChange={handleFileChange} />
      </div>
    </div>
  );
}

export default Step1Capture;
