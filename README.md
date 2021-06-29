# My Stores Applications

## Building the client with AWS Amplify

### 1. Setup project

1. Create the react app 

````
npx create-react-app client
````

2. Initialize the amplify app in the client directory

````
amplify init
````

3. Install dependencies

````
npm install bootstrap
npm install @aws-amplify/ui-react
npm install @craco/craco --save
npm install amazon-location-helpers aws-sdk
npm install react-map-gl maplibre-gl
````

4. Configure craco

Create a craco config file 

````
cp base/01-craco.config.js craco.config.js
````

Make changes in the package json

````
/* package.json */

"scripts": {
-   "start": "react-scripts start",
+   "start": "craco start",
-   "build": "react-scripts build",
+   "build": "craco build"
-   "test": "react-scripts test",
+   "test": "craco test"
}
````

5. Add authentication

````
amplify add auth
amplify push --yes
````

6. Modify the client to show the auth

```
cp base/01-App.js src/App.js
cp base/01-Header.js src/components/Header.js
```

6. Start the app

```
npm start
```

Create a new account and see the page resulting

### 2. Show a map

1. Now you need to go into your AWS account and create a new map in the Amazon Location service.

2.  Give permissions to your Amplify application to access maps

```
amplify console auth
```

And select Identity Pool, check the name of the auth role and add this inline policy to the role.

Replace the information with your account information.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "geo:GetMap*",
            "Resource": "arn:aws:geo:<REGION>:<ACCOUNTNUMBER>:map/<NAMEOFMAP>"
        }
    ]
}
```

And save the new inline policy with a name, eg. getMap.

3. Add the client code. 
Make sure to name the variable "MAP_NAME" with the map name gave your map in the Location Service.

````
cp base/02-App.js src/App.js
````

### 3. Add an API with a list of stores and display it

1. Create a new GraphQL API

````
amplify add api
````

2. Go and modify the schema.graphql

You can find it in:
client/amplify/backend/api/{NAME OF YOUR API}/schema.graphql
And you can replace that with the file in base/03-schema.graphql (make sure you change the name)

Deploy the changes to the cloud

````
amplify push --yes
````

3. Go to the AppSync service in AWS and add the stores.

You can use the API directly from the service, for that you will need to log in with your user.

Type the following query
````
mutation MyMutation1 {
  createStore(input: {
    latitude: "-34.923871148988646", 
    longitude: "-56.15893363952637", 
    name: "Store Punta Carretas Shopping"}) {
    id
  }
}

mutation MyMutation2 {
  createStore(input: {
    latitude: "-34.881107970659976", 
    longitude: "-56.081106662750244", 
    name: "Store Portones Shopping"}) {
    id
  }
}

mutation MyMutation3 {
  createStore(input: {
    latitude: "-34.84022457866127", 
    longitude: "-55.99353790283203", 
    name: "Store Costa Urbana Shopping"}) {
    id
  }
}

mutation MyMutation4 {
  createStore(input: {
    latitude: "-34.86872361072668", 
    longitude: "-56.16732358932495", 
    name: "Store Nuevo Centro Shopping"}) {
    id
  }
}

mutation MyMutation5 {
  createStore(input: {
    latitude: "-34.9029674883098", 
    longitude: "-56.1361026763916", 
    name: "Store Montevideo Shopping"}) {
    id
  }
}

````

Now you have 5 stores in your API.

4. Modify the client to display the stores

````
cp base/03-App.js src/App.js
cp base/03-StoreList.js src/components/StoreList.js
````

## 4. Show the stores in the map 

1. Create a folder inside src call data and copy the 04-store-list.geo.json

````
cp base/04-store-list.geo.json src/data/store-list.geo.json
````

2. Draw the geofence in the map using layers

````
cp base/04-App.js src/App.js
````

3. When clicking in one store in the list navigate there
For that change the App.js and the StoreList.js

````
cp base/041-App.js src/App.js
cp base/041-StoreList.js src/components/StoreList.js
````

## 5. Add routing capability

1. Go to the location services and create a new Route Calculator and a Search Index

2. Go to the Role (the one you found in step 2.2) and add a new inline policy

````
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "geo:CalculateRoute",
            "Resource": "arn:aws:geo:<REGION>:<ACCOUNTNUMBER>:route-calculator/<YOURROUTECALCULATORNAME>"
        }
    ]
}
````

Save with any name, eg. CalculateRoute

3. Then add another inline policy that allows you to do a search in a search index.

````
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "geo:SearchPlaceIndexForText",
            "Resource": "arn:aws:geo:<REGION>:<ACCOUNTNUMBER>:place-index/<SEARCHINDEXNAME>"
        }
    ]
}
````

4. Install some more dependencies

````
npm i react-hook-form
npm i @turf/turf
````

5. First we are going to create a routing component were we can put a from to where find the route.

````
cp base/05-Routing.js src/components/Routing.js
````

6. Then we want to add the Pin component that is the one that will show the FROM in the map.

````
cp base/05-Pin.js src/components/Pin.js
````

7. Create a helper file where there will be some aux methods for calculating the routes and also modify the App.js

````
cp base/05-App.js src/App.js
cp base/05-RoutingHelpers.js src/helpers/RoutingHelpers.js
````
Now you should be able to draw routes in the map.

Try from: "Juan Benito Blanco 661, Montevideo" and then pick a store from the dropdown of the To.


## 6. Send an event when the user gets close to a store

1. Go to the location services and create a geofence collection.
Then add the file 04-store-list.geo.json as geofences. This should create 5 geofences inside the collection.

Make sure that you enable the eventbridge + cloudwatch integration


2. Go again to the Role and add one more inline policy

````
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "geo:BatchEvaluateGeofences",
            "Resource": "arn:aws:geo:<REGION>:<ACCOUNTNUMBER>:geofence-collection/<YOUR GEOFENCE COLLECTION>"
        }
    ]
}
````
You can call it anything you like, eg. geofence

3. We are going to make the pin dragable so we can move it inside the geofences we draw in the map earlier.

When we move the pin we want to evaluate if the pin is inside the geofence or not.

````
cp base/06-App.js src/App.js
````

Now you can test this. Go to cloudwatch and find the right log group, you will see the events when the pin is dragged in and out of the geofences.