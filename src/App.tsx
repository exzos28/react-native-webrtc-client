import React from 'react';
import {RootProvider} from './Root';
import Call from './Call';

const App = () => {
  return (
    <>
      <RootProvider>
        <Call />
      </RootProvider>
    </>
  );
};

export default App;
