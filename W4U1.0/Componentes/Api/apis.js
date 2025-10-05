import axios from "axios";

// const IP_ADDRESS = '10.0.2.2';    // Para o Emulador Android
// const IP_ADDRESS = 'localhost';   // Para o Simulador iOS

const API_BASE_URL = "http://192.168.1.2:8081/auth";

/**
 * Função para fazer o login do usuário.
 * @param {string} email - O email do usuário.
 * @param {string} senha - A senha do usuário.
 * @returns {Promise<object>} - Os dados da resposta, incluindo o token.
 */
export const loginUser = async (email, senha) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      senha,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erro no login:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

/**
 * Função para registrar um novo usuário.
 * @param {object} userData - Os dados do usuário para registro (ex: nome, email, senha).
 * @returns {Promise<object>} - A mensagem de sucesso.
 */
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error(
      "Erro no registro:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

/**
 * Função para anunciar um novo serviço, incluindo uma foto.
 * @param {string} categoria - A categoria do serviço.
 * @param {string} descricao - A descrição do serviço.
 * @param {string} photoUri - O URI local da foto em React Native.
 * @returns {Promise<object>} - Os dados da resposta do servidor.
 */
export const anunciarServico = async (categoria, descricao, photoUri) => {
  try {
    const formData = new FormData();
    formData.append('categoria', categoria);
    formData.append('descricao', descricao);
    
    const fileExtension = photoUri.split('.').pop();
    const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

    formData.append('image', {
      uri: photoUri,
      name: `service-photo-${Date.now()}.${fileExtension}`,
      type: mimeType, 
    });

    const response = await axios.post(`${API_BASE_URL}/anunciar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
      timeout: 15000,
    });
    
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao anunciar serviço:",
      error.response ? error.response.data : error.message
    );
    throw error; 
  }
};

// adicionar as outras funções aqui (esqueceu-senha, validar-pin, etc.)
// seguindo o mesmo padrão.

