import {observable} from 'mobx';
import {
  RTCIceCandidateType,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';
import io from 'socket.io-client';
import {Root} from '../Root';
import {Socket} from './Socket';

export enum Status {
  Default,
  Queueing,
  InRoom,
}

export default class SocketService implements Socket {
  readonly socket: SocketIOClient.Socket;
  @observable logined: boolean = false;
  @observable status: Status = Status.Default;

  // TODO Пренести в другой сервис

  constructor(private readonly _root: Root) {
    this.socket = io('wss://rev.yoldi.agency', {
      transports: ['websocket'],
    });
  }

  checkConnected = () => {
    if (!this.logined) {
      return;
    }
  };

  sendIceCandidate = (candidate: RTCIceCandidateType) => {
    this.checkConnected();
    this.socket.emit('RTC_ICE_CANDIDATE', {
      candidate: JSON.stringify(candidate),
    });
  };

  sendDescription = (data: RTCSessionDescriptionType) => {
    this.socket.emit('RTC_DESCRIPTION', {
      description: JSON.stringify(data),
    });
  };

  enterQueue = () => {
    this.socket.emit('ENTER_QUEUE', {
      forceClassic: true,
    });
    this.status = Status.Queueing;
  };

  stop = () => {
    this.leaveRoom();
    this.leaveQueue();
    this._root.peerConnection.restartPeerConnection();
    this.status = Status.Default;
  };

  leaveQueue = () => {
    this.socket.emit('LEAVE_QUEUE');
  };

  leaveRoom = () => {
    this.socket.emit('LEAVE_ROOM');
  };

  nextRoom = async () => {
    this.leaveRoom();
    this.leaveQueue();
    this._root.peerConnection.restartPeerConnection();
  };

  // TODO Typing
  private onIceCandidate = async (data: any) => {
    try {
      await this._root.peerConnection.addIceCandidate(
        JSON.parse(data.candidate),
      );
    } catch (ignore) {}
  };

  // TODO Typing
  private onEnterRoom = async (data: any) => {
    const initiator = data.initiator;
    if (initiator) {
      this._root.peerConnection.createOfferAndSendDescription();
    }
  };

  private onLeaveRoom = async () => {
    this.leaveQueue();
    this._root.peerConnection.restartPeerConnection();
    this.status = Status.Default;
  };

  // TODO Typing
  private onRtcDescription = async (data: any) => {
    const description: RTCSessionDescriptionType = JSON.parse(data.description);
    if (description.type === 'answer') {
      await this._root.peerConnection.setRemoteDescription(description);
    } else if (description.type === 'offer') {
      await this._root.peerConnection.setRemoteDescriptionCreateAnswerAndSend(
        description,
      );
    }
    this.status = Status.InRoom;
  };

  subscribe() {
    this.socket.on('connect', () => {
      this.socket.emit('AUTHENTICATION_MESSAGE', {
        token: '',
      });
      this.socket.once('PEER_ID_ASSIGN', () => {
        this.logined = true;
      });
    });
    this.socket.on('ENTER_ROOM', this.onEnterRoom);
    this.socket.on('LEAVE_ROOM', this.onLeaveRoom);

    this.socket.on('RTC_DESCRIPTION', this.onRtcDescription);
    this.socket.on('RTC_ICE_CANDIDATE', this.onIceCandidate);
    this.socket.on('disconnect', () => {
      this.logined = false;
    });
    return () => {};
  }
}
