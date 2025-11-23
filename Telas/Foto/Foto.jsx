import { StyleSheet, Text, View, Button , TouchableOpacity} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef  } from 'react';

export default function Foto(props){

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Nós precisamos permissão para utilizar a câmera</Text>
        <Button onPress={requestPermission} title="Solicitar Permissão Câmera" />
      </View>
    );
  }

  function toggleCameraFacing() {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleClick = async () => {
    if (cameraRef.current) {
        const newPhoto = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        props.onDadosRecebidos(newPhoto);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={facing}
          ref={cameraRef}
        />
        <View style={styles.overlayControls} pointerEvents="box-none">
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Virar Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={handleClick}>
              <Text style={styles.text}>Tirar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );


}



const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
      textAlign: 'center',
      paddingBottom: 10,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  overlayControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 24,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  text: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
   },

});
