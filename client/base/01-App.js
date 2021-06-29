import './App.css';

import Amplify from 'aws-amplify';
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './components/Header'

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const App = () => {

  return (
    <AmplifyAuthenticator>
      <div className="App">
        <Header />
        HELLO MAPS
      </div>
    </AmplifyAuthenticator>
  );
}

export default App;