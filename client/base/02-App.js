import './App.css';
import React, { useEffect, useState } from "react";

import Amplify, { Auth } from "aws-amplify";
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';
import { createRequestTransformer } from "amazon-location-helpers";

import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './components/Header'

import ReactMapGL, { NavigationControl } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

//* ---- CONSTANTS ----- */
const MAP_NAME = "store1Maps";

const INITIAL_VIEWPORT = {
  longitude: -56.164532,
  latitude: -34.901112,
}

//* --------- */

const App = () => {

  const [credentials, setCredentials] = useState();
  const [transformRequest, setRequestTransformer] = useState();

  const [viewport, setViewport] = useState({
    longitude: INITIAL_VIEWPORT.longitude,
    latitude: INITIAL_VIEWPORT.latitude,
    zoom: 13,
  });

  useEffect(() => {
    const fetchCredentials = async () => {
      setCredentials(await Auth.currentUserCredentials());
    };

    fetchCredentials();
  }, []);

  useEffect(() => {
    const makeRequestTransformer = async () => {
      if (credentials != null) {
        const tr = await createRequestTransformer({
          credentials,
          region: awsconfig.aws_project_region,
        });
        setRequestTransformer(() => tr);
      }
    };

    makeRequestTransformer();
  }, [credentials]);

  return (
    <AmplifyAuthenticator>
      <div className="App">
        <Header />
        <div>
          {transformRequest ? (
            <ReactMapGL
              {...viewport}
              width="100%"
              height="100vh"
              transformRequest={transformRequest}
              mapStyle={MAP_NAME}
              onViewportChange={setViewport}
            >
              <div style={{ position: "absolute", left: 20, top: 20 }}>
                <NavigationControl showCompass={false} />
              </div>
            </ReactMapGL>
          ) : (
            <h1>Loading...</h1>
          )}
        </div>
      </div>
    </AmplifyAuthenticator>
  );
}

export default App;