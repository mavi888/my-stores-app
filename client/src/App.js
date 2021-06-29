import './App.css';
import React, { useEffect, useState, useCallback } from "react";

import Amplify, { Auth, API, graphqlOperation } from "aws-amplify";
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';

import Location from "aws-sdk/clients/location";
import { createRequestTransformer } from "amazon-location-helpers";

import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './components/Header'
import StoreList from './components/StoreList'
import Routing from './components/Routing'
import Pin from './components/Pin'
import {
  searchPlace,
  calculateRoute,
  makeLegFeatures
} from './helpers/RoutingHelpers';

import ReactMapGL, {
  NavigationControl,
  Source,
  Layer,
  Marker
} from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from '@turf/turf'

import { listStores } from './graphql/queries';

import shoppingCenters from './data/store-list.geo.json'

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

//* ---- CONSTANTS ----- */
const MAP_NAME = "store1Maps";
const SEARCH_INDEX = 'MyPlaceIndex';
const ROUTE_CALCULATOR = 'StoreRouteCalculator';
const COLLECTION_NAME = 'stores'

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

const routeLayer = {
  type: "line",
  layout: {
    "line-join": "round"
  },
  paint: {
    "line-color": "green",
    "line-width": 3
  }
}

const App = () => {

  const [credentials, setCredentials] = useState();
  const [transformRequest, setRequestTransformer] = useState();
  const [stores, setStores] = useState([]);
  const [client, setClient] = useState(null);
  const [routeLine, setRouteLine] = useState(turf.featureCollection([]))

  const [viewport, setViewport] = useState({
    longitude: INITIAL_VIEWPORT.longitude,
    latitude: INITIAL_VIEWPORT.latitude,
    zoom: 13,
  });

  const [searchMarker, setSearchMarker] = useState({
    longitude: INITIAL_VIEWPORT.longitude,
    latitude: INITIAL_VIEWPORT.latitude
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

    const createClient = async () => {
      const credentials = await Auth.currentCredentials();
      const client = new Location({
        credentials,
        region: awsconfig.aws_project_region,
      });
      setClient(client);
    }

    createClient();
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

  useEffect(() => {
    async function evaluateGeofence() {
      if (!client) return

      const params = {
        CollectionName: COLLECTION_NAME,
        DevicePositionUpdates: [
          {
            DeviceId: 'storeApps',
            Position: [searchMarker.longitude, searchMarker.latitude],
            SampleTime: new Date
          }
        ]
      };
      await client.batchEvaluateGeofences(params).promise();
    }

    evaluateGeofence()

  }, [searchMarker])

  const findRoute = async (from, to) => {
    //1. get the positions for the selected store
    const store = stores.find(item => {
      return item.name === to
    });

    // 2. get the position for the searched address
    const fromCoordinates = await searchPlace(SEARCH_INDEX, client, from);

    setViewport({
      longitude: fromCoordinates[0],
      latitude: fromCoordinates[1],
      zoom: 13
    });

    setSearchMarker({
      longitude: fromCoordinates[0],
      latitude: fromCoordinates[1],
    })

    // 3. calculate route
    const fromAddress = {
      longitude: fromCoordinates[0],
      latitude: fromCoordinates[1]
    }

    const toStore = {
      longitude: parseFloat(store.longitude),
      latitude: parseFloat(store.latitude)
    }

    const routeResp = await calculateRoute(ROUTE_CALCULATOR, client, fromAddress, toStore);
    console.log(routeResp)

    const route = makeLegFeatures(routeResp.Legs);
    console.log(route);

    setRouteLine(turf.featureCollection(route));
  }

  const onMarkerDragEnd = useCallback((event) => {
    setSearchMarker({
      longitude: event.lngLat[0],
      latitude: event.lngLat[1],
    })
  }, [])

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

                    <Marker
                      longitude={searchMarker.longitude}
                      latitude={searchMarker.latitude}
                      offsetTop={-20}
                      offsetLeft={-10}
                      draggable
                      onDragStart={console.log}
                      onDrag={console.log}
                      onDragEnd={onMarkerDragEnd}
                    >
                      <Pin size={20} />
                    </Marker>

                    <Source id="shoppingCenters" type="geojson" data={shoppingCenters}>
                      <Layer {...shoppingCentersDataLayer} />
                    </Source>

                    <Source id="routeLine" type="geojson" data={routeLine}>
                      <Layer {...routeLayer} />
                    </Source>
                  </ReactMapGL>
                ) : (
                  <h1>Loading...</h1>
                )}
              </div>
            </div>
            <div className="col-sm-3">
              <Routing
                stores={stores}
                findRoute={findRoute} />
              <StoreList
                stores={stores}
                changeViewport={setViewport}
              />
            </div>
          </div>
        </div>
      </div>
    </AmplifyAuthenticator>
  );
}

export default App;