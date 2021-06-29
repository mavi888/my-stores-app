import './App.css';
import React, { useEffect, useState } from "react";

import Amplify, { Auth, API, graphqlOperation } from "aws-amplify";
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';
import { createRequestTransformer } from "amazon-location-helpers";

import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './components/Header'
import StoreList from './components/StoreList'

import ReactMapGL, {
  NavigationControl,
  Source,
  Layer
} from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { listStores } from './graphql/queries';

import shoppingCenters from './data/store-list.geo.json'

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

//* ---- CONSTANTS ----- */
const MAP_NAME = "store1Maps";

const INITIAL_VIEWPORT = {
  longitude: -56.164532,
  latitude: -34.901112,
}

//* --------- */

const shoppingCentersDataLayer = {
  id: 'att-data',
  type: 'fill',
  paint: {
    'fill-color': 'blue',
    'fill-opacity': 0.3,
  },
}


const App = () => {

  const [credentials, setCredentials] = useState();
  const [transformRequest, setRequestTransformer] = useState();
  const [stores, setStores] = useState([]);

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

    const getStores = async () => {
      console.log('get stores')
      var result = await API.graphql(graphqlOperation(listStores));
      const items = result.data.listStores.items;
      setStores(items)
    }
    getStores();
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
        <div className="container">
          <div className="row">
            <div className="col">
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

                    <Source id="shoppingCenters" type="geojson" data={shoppingCenters}>
                      <Layer {...shoppingCentersDataLayer} />
                    </Source>
                  </ReactMapGL>
                ) : (
                  <h1>Loading...</h1>
                )}
              </div>
            </div>
            <div className="col-sm-3">
              <StoreList stores={stores} />
            </div>
          </div>
        </div>
      </div>
    </AmplifyAuthenticator>
  );
}

export default App;