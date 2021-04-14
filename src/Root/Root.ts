import {PeerConnection} from '../PeerConnection';
import {SocketService} from '../Socket';
import batchDisposers from '../utils/batchDisposers';

export default class Root {
  readonly socket = new SocketService(this);
  readonly peerConnection = new PeerConnection(this);

  subscribe = () => batchDisposers(this.socket.subscribe());
}
