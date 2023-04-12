import { useEffect, useState } from 'react';

import OnboardingAccess from './onboardingAccess.js';
import OnboardingMenu from './onboardingMenu.js';

import './onboarding.css';

function Onboarding({ refAR }) {
  const [accessLocation, setAccessLocation] = useState(false);
  const [accessCamera, setAccessCamera] = useState(false);
  const [accessOrientation, setAccessOrientation] = useState(false);

  const [accessLocationError, setAccessLocationError] = useState(false);
  const [accessCameraError, setAccessCameraError] = useState(false);
  const [accessOrientationError, setAccessOrientationError] = useState(false);

  // TODO: Add geolocation.
  const onboardingConstraints = {
    video: true,
    audio: false
  };

  useEffect(() => {
    if (navigator.permissions) {
      // Location access check.
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          setAccessLocation(true);
        } else if (result.state === "prompt") {
          // Not Needed.
        } else if (result.state === "denied") {
          setAccessLocationError(true);
        }
      });

      // Camera access check.
      navigator.permissions.query({ name: "camera" }).then((result) => {
        if (result.state === "granted") {
          setAccessCamera(true);
        } else if (result.state === "prompt") {
          // Not Needed.
        } else if (result.state === "denied") {
          setAccessCameraError(true);
        }
      });

      // Device Orientation access check - enable for Android.
      if (typeof(DeviceOrientationEvent) !== "undefined"
          && typeof(DeviceOrientationEvent.requestPermission) !== "function") {
        setAccessOrientation(true);
      } else if (typeof(DeviceOrientationEvent) === "undefined") {
        setAccessOrientationError(true);
      }
    }

    return () => {
      // Cleanup.
    };
  }, []);

  // Location access request.
  function chainLocationAccessRequest() {
    navigator.geolocation.getCurrentPosition((position) => {
      setAccessLocation(true);
    }, (err) => {
      setAccessLocationError(true);
    });
  }

  // Camera access request.
  function chainCameraAccessRequest() {
    navigator.mediaDevices.getUserMedia(onboardingConstraints).then((stream) => {
      stream.getVideoTracks().forEach(track => track.stop());

      setAccessCamera(true);
    }).catch(function(err) {
      setAccessCameraError(true);
    });
  }

  // Device Orientation access request - iOS.
  function chainOrientationAccessRequest() {
    if (typeof(DeviceOrientationEvent) !== "undefined"
      && typeof(DeviceOrientationEvent.requestPermission) === "function") {
      DeviceOrientationEvent.requestPermission()
        .then( response => {
          if ( response == "granted" ) {
            setAccessOrientation(true);
          } else {
            setAccessOrientationError(true);
          }
        });
    } else if (typeof(DeviceOrientationEvent) !== "undefined") {
      // Android enabled by default.
      setAccessOrientation(true);
    } else {
      setAccessOrientationError(true);
    }
  }

  function handleAccessRequest(e) {
    e.preventDefault();

    chainLocationAccessRequest();
    chainCameraAccessRequest();
    chainOrientationAccessRequest();
  }

  function getAccessError() {
    const defaultText = "Doh! We've hit an issue accessing what we need to make things work :(";
    let descriptiveText = "";
    
    if (accessLocationError) {
      descriptiveText = "Location access wasn't granted. Please allow access in your browser's settings page.";
    }

    if (accessCameraError) {
      descriptiveText = "Camera access wasn't granted. Please allow access in your browser's settings page.";
    }

    if (accessOrientationError) {
      descriptiveText = "Your browser doesn't support Orientation";
    }

    return (
      <p class="accessError">{defaultText}<br /><br />{descriptiveText}</p>
    )
  }

  return (
  	<div class="onboarding">
      <h1>Welcome</h1>
      <h4>The <i>Echo Project</i> is on a mission to build an timeless world of memories - for you, your kids, your family &amp; friends, ... everyone.</h4>
      <h4>An <i>Echo</i> is your memory - planted in a location - for future others to see a snapshot into the past.</h4>
      {(accessLocationError || accessCameraError || accessOrientationError) && getAccessError()}
      {(!accessLocation || !accessCamera || !accessOrientation) && <OnboardingAccess onClick={handleAccessRequest} />}
      {(accessLocation && accessCamera && accessOrientation) && <OnboardingMenu onOpen={refAR.current.activateAR} />}
    </div>
  );
}

export default Onboarding;
