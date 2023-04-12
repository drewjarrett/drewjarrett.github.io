import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";


import { LoadingProvider } from "./loading/loadingContext.js";
import Loading from './loading/loading.js';

import './index.css';

import About from './home/about.js';
import AR from './ar/ar.js';
import Create from './create/create.js';
import Error404 from './error404.js';
import Home from './home/home.js';

import Onboarding from './home/onboarding/onboarding.js';


const refAR = React.createRef();
const refCreate = React.createRef();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: <Onboarding refAR={refAR} />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
  {
    path: "create",
    element: <Create refAR={refAR} ref={refCreate} />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render( 
  <LoadingProvider>
    <Loading />
    <AR ref={refAR} refCreate={refCreate} />
    <RouterProvider router={router} />
  </LoadingProvider>
);//<React.StrictMode>

reportWebVitals();
