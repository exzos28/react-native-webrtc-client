import {action, observable} from 'mobx';
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidateType,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';
import {Root} from '../Root';
import {peerConfig} from './config';

export default class PeerConnection {
  @observable localStream: MediaStream | undefined;
  @observable remoteStream: MediaStream | undefined;

  private peerConnection: RTCPeerConnection;

  constructor(private readonly _root: Root) {
    this.peerConnection = new RTCPeerConnection(peerConfig);
    this.listenPeer();

    this.configureLocalStream();
  }

  restartPeerConnection = () => {
    this.remoteStream = undefined;
    this.peerConnection.close();
    this.peerConnection = new RTCPeerConnection(peerConfig);
    this.listenPeer();
  };

  createOfferAndSendDescription = async () => {
    const offer = await this.peerConnection.createOffer({iceRestart: true});
    await this.peerConnection.setLocalDescription(
      new RTCSessionDescription(offer),
    );
    this._root.socket.sendDescription(offer);
  };

  createAnswerAndSendDescription = () => {};

  setRemoteDescription = (description: RTCSessionDescriptionType) =>
    this.peerConnection.setRemoteDescription(description);

  setRemoteDescriptionCreateAnswerAndSend = async (
    description: RTCSessionDescriptionType,
  ) => {
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(description),
    );
    const anwer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(
      new RTCSessionDescription(anwer),
    );

    this._root.socket.sendDescription(anwer);
  };

  addIceCandidate = (candidate: RTCIceCandidateType) =>
    this.peerConnection.addIceCandidate(candidate);

  @action
  configureLocalStream = async () => {
    const s = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (typeof s !== 'boolean') {
      this.peerConnection.addStream(s);
      this.localStream = s;
    }
  };

  private listenPeer = () => {
    this.peerConnection.onaddstream = ({stream}) => {
      this.remoteStream = stream;
    };
    this.peerConnection.onicecandidate = ({candidate}) => {
      this._root.socket.sendIceCandidate(candidate);
    };
    this.peerConnection.onnegotiationneeded = () => {
      console.log('onnegotiationneeded');
    };
  };
}
