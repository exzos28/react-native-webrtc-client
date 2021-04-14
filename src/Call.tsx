import {observer} from 'mobx-react';
import React, {useMemo} from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import {useRoot} from './Root';
import {Status} from './Socket/SocketService';

export default observer(() => {
  const root = useRoot();
  const {
    peerConnection: {remoteStream, localStream},
    socket: {enterQueue, leaveQueue, stop, status},
  } = root;

  const renderFooter = () => {
    switch (status) {
      case Status.Queueing:
        return (
          <>
            <Button onPress={stop} title="Остановить" color="red" />
            <ActivityIndicator size="large" color="blue" />
          </>
        );
      case Status.InRoom:
        return (
          <>
            <Button onPress={stop} title="Остановить" color="red" />
            <Button onPress={() => {}} title="Следующий" />
          </>
        );
      default:
        return <Button onPress={enterQueue} title="Найти собеседника" />;
    }
  };

  const styles = useStyles();

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.root}>
        <View style={styles.body}>
          {remoteStream && (
            <View style={styles.steamView}>
              <RTCView
                streamURL={remoteStream.toURL()}
                style={styles.streamRTCView}
              />
            </View>
          )}
          <View style={styles.steamView}>
            {localStream && (
              <RTCView
                streamURL={localStream.toURL()}
                style={styles.streamRTCView}
              />
            )}
          </View>
        </View>
        <View style={styles.footerView}>{renderFooter()}</View>
      </SafeAreaView>
    </>
  );
});

const useStyles = () =>
  useMemo(
    () =>
      ({
        root: {
          flex: 1,
          backgroundColor: '#fff',
        },
        body: {
          flex: 1,
          backgroundColor: '#000',
        },
        steamView: {
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#000',
        },
        streamRTCView: {
          flex: 1,
        },
        footerView: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          padding: 10,
        },
      } as const),
    [],
  );
