import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

import Step1Capture from './step1-capture.js';
import Step2Create from './step2-create.js';
import Step3Complete from './step3-complete.js';

import './create.css';


const Create = forwardRef((props, ref) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const routeParams = useParams();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (routeParams.id && routeParams.id === 'complete') {
      setStep(3);
    }
  }, []);

  function handleStart() {
    setStep(1);
  }

  function handleCaptureComplete() {
    setStep(2);
  }

  useImperativeHandle(ref, () => ({
    handleDropEchoComplete() {
      setStep(3);
    }
  }));

  function handleFinish() {
    navigate('/');
  }

  return (
    <div class="create">
      <canvas ref={canvasRef}></canvas>
      <header>
        <Link to="/">Echo Logo</Link>. Create Echo.
      </header>
      <div className={`steps step${step}`}>
        <ul>
          <li class="step1">
            Step 1: Strike a pose.
            <div class="detail">Take / Upload a picture / selfie to turn into an Echo.</div>
           </li>
          <li class="step2">
            Step 2: Looking good?
            <div class="detail">Frame your pitcure as a memory? or create a Ghost!</div>
          </li>
          <li class="step3">
            Step 3: Drop your Echo.
            <div class="detail">Welcome to the Echo world! Choose where to drop your Echo.</div>
          </li>
        </ul>
      </div>
      <div className={`body step${step}`}>
        {step === 1
          && <Step1Capture handleCaptureComplete={handleCaptureComplete}
                           canvasRef={canvasRef} />}
        {step === 2
          && <Step2Create handleStart={handleStart}
                          handleComplete={props.refAR.current.activateCreateAR}
                          canvasRef={canvasRef} />}
        {step === 3
          && <Step3Complete handleFinish={handleFinish} />}
      </div>
    </div>
  );
});

export default Create;
