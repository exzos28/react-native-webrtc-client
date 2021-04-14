import React, {FC, ReactNode, useEffect, useState} from 'react';
import Root from './Root';
import RootContext from './RootContext';

const RootProvider: FC<{children: ReactNode}> = ({children}) => {
  const [root] = useState<Root>(new Root());
  useEffect(() => root?.subscribe(), [root]);
  return <RootContext.Provider value={root}>{children}</RootContext.Provider>;
};

export default RootProvider;
