import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({

    container : {
        felx: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    texto: {
        fontSize: 20,
        fontFamily: 'Arial'
    },
    image : {
        width: 300,
        height: 200,
        resizeMode: 'contain',
        margin: 10
    },
    buttonCadastro: {
        backgroundColor: '#154360',
        width: '90%',
        margin: 10,
        height: 60,
        borderRadius: 20
    },
     buttonLogin: {
        backgroundColor: '#fff',
        width: '90%',
        margin: 10,
        height: 60,
        borderRadius: 20,
        borderColor: '#000',
        borderStyle: 'solid',
        borderWidth: 3
    },
       buttonTextoLogin: {
        fontFamily: 'Arial',
        fontSize: 20,
        textAlign: 'center',
        paddingTop: 15,
        color: '#000'
    },
    buttonTexto: {
        fontFamily: 'Arial',
        fontSize: 20,
        textAlign: 'center',
        paddingTop: 15,
        color: '#ffffff'
    },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%'
    }
    



})

export default Estilos;