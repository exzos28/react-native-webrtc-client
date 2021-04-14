import {
  RTCIceCandidateType,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';

export interface Socket {
  socket: SocketIOClient.Socket;
  logined: boolean;
  checkConnected: () => void;
  sendIceCandidate: (candidate: RTCIceCandidateType) => void;
  sendDescription: (data: RTCSessionDescriptionType) => void;
  enterQueue: () => void;
  leaveQueue: () => void;
  nextRoom: () => void;

  subscribe(): () => void;
}
