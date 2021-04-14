import {useContext} from 'react';
import RootContext from './RootContext';

export default () => {
  const root = useContext(RootContext);
  if (!root) {
    throw new Error('The root store has been used out of context');
  }
  return root;
};
