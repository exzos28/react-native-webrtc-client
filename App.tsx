import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from 'react-native-webrtc';
import io from 'socket.io-client';

type Device = {
  groupId: string;
  facing: 'environment' | 'front';
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput';
};

const socket = io('wss://192.168.0.67:5000', {
  transports: ['websocket'],
  jsonp: false,
  reconnection: true,
});

const peerConnection = new RTCPeerConnection({
  iceServers: [{url: 'stun:stun.l.google.com:19302'}],
});
const callUser = async (socketId: string) => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  socket.emit('call-user', {
    offer,
    to: socketId,
  });
};

let isAlreadyCalling = false;

const App = () => {
  const [stream, setStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [devices, setDevices] = useState<Device[]>();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      peerConnection.onaddstream = function ({stream}) {
        setRemoteStream(stream);
      };

      socket.on('update-user-list', ({users}) => {
        setUsers(users);
      });

      socket.on('call-made', async data => {
        console.log('call-made');
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer),
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(
          new RTCSessionDescription(answer),
        );

        socket.emit('make-answer', {
          answer,
          to: data.socket,
        });
      });

      socket.on('answer-made', async data => {
        if (isAlreadyCalling) {
          return;
        }
        console.log('answer-made');
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );

        callUser(data.socket);
        isAlreadyCalling = true;
      });

      const devices = await mediaDevices.enumerateDevices();
      setDevices(devices);
      handleDevicePress(devices[0]);
    }
    load();
  }, []);

  const handleDevicePress = async (d: Device) => {
    const s = await mediaDevices.getUserMedia({
      video: {
        mandatory: {
          minWidth: 8000,
          minHeight: 4000,
          minFrameRate: 60,
        },
        facingMode: d.facing === 'front' ? 'user' : 'environment',
        optional: [{sourceId: d.deviceId}],
      },
      audio: true,
    });
    if (typeof s !== 'boolean') {
      peerConnection.addStream(s);
      setStream(s);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={{flex: 1}} contentContainerStyle={{flex: 1}}>
        <SafeAreaView style={{flex: 1}}>
          {/* {devices?.map(
            d =>
              d.kind === 'videoinput' && (
                <TouchableOpacity
                  key={d.deviceId}
                  onPress={() => handleDevicePress(d)}>
                  <Text>{JSON.stringify(d)}</Text>
                </TouchableOpacity>
              ),
          )} */}
          <Text style={{fontSize: 24}}>Users:</Text>
          {users.map(u => (
            <TouchableOpacity key={u} onPress={() => callUser(u)}>
              <Text style={{fontSize: 20}}>{JSON.stringify(u)}</Text>
            </TouchableOpacity>
          ))}
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{flex: 1}}>
              {stream && (
                <RTCView streamURL={stream.toURL()} style={{flex: 1}} />
              )}
            </View>
            <View style={{flex: 1}}>
              {remoteStream && (
                <RTCView streamURL={remoteStream.toURL()} style={{flex: 1}} />
              )}
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

export default App;
