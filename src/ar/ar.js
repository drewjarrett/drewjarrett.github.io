import { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { LoadingContext } from '../loading/loadingContext.js';

import { ThreeAR } from './threear.js';
import { WebXR } from './webxr.js';

import './ar.css';

const AR = forwardRef((props, ref) => {

  // Onboarding
  const [isStabilized, setIsStabilized] = useState(false);
  const [accuracy, setAccuracy] = useState(20);

  // Active Session
  const [arSession, setArSession] = useState(null);
  const [geoSession, setGeoSession] = useState(null);

  // Create Image Session.
  const [createImgSrc, setCreateImgSrc] = useState(null);
  const [isCreated, setIsCreated] = useState(false);

  // Calculate position
  //??

  const {setIsLoading} = useContext(LoadingContext);
  const imgRef = useRef(null);

  // Assuming 15 as a good accuracy!
  const targetAccuracy = 20;

  useImperativeHandle(ref, () => ({
    activateAR() {
      openARSession();      
    },

    activateCreateAR(imgSrc) {
      setCreateImgSrc(imgSrc);

      openARSession(true);
    }
  }));

  // Onboarding functions.

  function stabilizedCallback() {
    setIsStabilized(true)
  }

  // Active Session functions.

  function initPosition() {
    const geolocationOptions = {
      maximumAge: 50, 
      enableHighAccuracy: true
    } 
    
    let prevLatLong = "0";

    setGeoSession(navigator.geolocation.watchPosition((position) => {
      if (position.coords.accuracy >= targetAccuracy) {
        setAccuracy(position.coords.accuracy);
        
        return;  
      }

      console.log(prevLatLong);
      console.log("VS");
      console.log(position.coords.latitude + ' - ' + position.coords.longitude);

      prevLatLong = position.coords.latitude + ' - ' + position.coords.longitude;
    }, (error) =>{
      // TODO: Handle Error.
    }, geolocationOptions));
  }

  function openARSession(isCreateImg) {
    initPosition();

    const supportsXR = 'xr' in window.navigator;
    //if(supportsXR) {
      //setArSession(new WebXR(stabilizedCallback, isCreateImg));
    //} else {
      setArSession(new ThreeAR(stabilizedCallback, isCreateImg));
    //}
  }

  function exitARSession () {
    navigator.geolocation.clearWatch(geoSession);

    setCreateImgSrc(null);
    setIsCreated(false);

    arSession.cleanUp().then(() => {
      setArSession(null);
    });

    //TODO: CLEAN UP SESSION some more (anyting else?).
    // i.e is the Canvas and VIDEO elements still in the DOM?
    // and renderer from threear ?
  }

  // Create Image Session functions.

  function handleCreateImg() {
    // setIsLoading(true);
    /*navigator.geolocation.getCurrentPosition((position) => {
      setCreateImgLatLng(
        'latitude: ' + position.coords.latitude
        + '; longitude: ' + position.coords.longitude);

      setIsLoading(false);
      cleanUp();

      navigate('/create/complete');
    });*/

    arSession.dropEcho(createImgSrc);

    setIsCreated(true);
    props.refCreate.current.handleDropEchoComplete();
  }

  if (!arSession) {
    return (
      <div class="ar"><div id="ar-overlay" class="hidden"></div></div>
    );
  } else {
    return (
      <div class="ar">
        <div id="ar-overlay">
          {!isStabilized &&
            <img class="stabilization-icon" src="/images/temp-notlicenced-stabilization.gif" />
          }

          <div class="menu">
            <p class="info">
              There are ## Echos around you
            </p>
            
            {!isStabilized &&
              <p class="notice">
                Move camera around your area and floor to help orientate.
              </p>
            }
            
            {accuracy > targetAccuracy &&
              <p class="notice">
                Waiting for GPS position:&nbsp;
                {Math.round((1 - ((accuracy-targetAccuracy) / targetAccuracy)) * 100)}%
              </p>
            }

            <p class="notice">
              DREW TESTING WALK FORWARD / BACK VALUE : ??
            </p>

            {isStabilized && createImgSrc && !isCreated &&
              <div class="create">
                <p>
                  Move to a position to drop your Echo.
                  Once dropped others in this location will be able to find it!
                </p>
                <button onClick={handleCreateImg}>Drop that Echo</button>
              </div>
            }
            {isCreated &&
              <div class="create">
                <p>
                  Congratulations, you did it! Your Echo is out there in the virtual world for others to find.
                </p>
              </div>
            }
            
            <button onClick={exitARSession}>Exit</button>
          </div>
        </div>
      </div>
    );
  }
});

export default AR;
