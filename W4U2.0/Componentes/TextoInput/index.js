import { Component } from "react";
import { TextInput, Text } from "react-native";
import Estilos from "../Estilos";

class TextoInput extends Component {
  render() {
    return (
      <>
        <Text
          style={{
            fontSize: 14,
            marginLeft: 23,
            marginBottom: -5,
            marginTop: 4,
          }}
        >
          {this.props.label}
        </Text>
        <TextInput
          style={this.props.Estilos}
          value={this.props.value}
          placeholder={this.props.placeholder}
          maxLength={this.props.maxLength}
          onChange={this.props.setValue}
        />
      </>
    );
  }
}

export default TextInput;
