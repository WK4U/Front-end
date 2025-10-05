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
        const newPhoto = await cameraRef.current.takePictureAsync();
        props.onDadosRecebidos(newPhoto);
    }
  }

  return (
         <View style={styles.container}>
            <CameraView style={styles.camera} 
                       facing={facing} 
                       ref={cameraRef} 
            
            >
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                  <Text style={styles.text}>Virar Câmera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleClick}>
                  <Text style={styles.text}>Tirar Foto</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
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
      justifyContent: 'center',
  },
  message: {
      textAlign: 'center',
      paddingBottom: 10,
  },
  camera: {
      flex: 1,
   },
  buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'transparent',
      margin: 64,
  },
  button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
  text: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
   },

});
