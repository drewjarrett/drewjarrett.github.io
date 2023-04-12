import {useContext } from 'react';
import { LoadingContext } from "./loadingContext.js";

import './loading.css';

function Loading() {
  const {isLoading} = useContext(LoadingContext);

  return (
  	<div id="loading" className={`${isLoading ? "isLoading" : "none"}`}>
      <h1>LOADING!</h1>
    </div>
  );
}

export default Loading;
