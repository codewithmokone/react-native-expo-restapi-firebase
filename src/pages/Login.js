import React, { useEffect, useState } from 'react'
import { Text, View, TextInput, StyleSheet, KeyboardAvoidingView, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const apiKey = 'AIzaSyBJM9aNj0Gh1kLLmpsHf9aTzVVW96oTKEA';
const API_URL = 'https://www.psswrd.net/api/v1/password/';

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idToken, setIdToken] = useState('');
  // const [expiresIn, setExpiresIn] = useState('');
  // const [refreshToken, setRefreshToken] = useState('');
  const [generatedPsswrd, setGeneratedPsswrd] = useState('')

  const navigation = useNavigation() // handles the nagivation to another screen

  // Handles the login function
  const handleLogin = async () => {

    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const userData = {
      email,
      password,
      returnSecureToken: true,
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      alert('Successfully logged in');

      const data = await response.json();
      setIdToken(data.idToken)

      // console.log("User data: ", data)

      if (data.idToken) {
        await AsyncStorage.setItem('userToken', data.idToken);
        await AsyncStorage.setItem('expiresIn', data.expiresIn.toString());
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }

      navigation.navigate("Home/:user", { user: data });

      return data
    } catch (err) {
      console.log('Login Failed: ', err)
    }
  }

  async function checkTokenAndExecuteRequest() {

    const storedToken = await AsyncStorage.getItem('userToken');

    if (storedToken) {
      navigation.navigate("Home/:user", { user: { idToken: storedToken } });
    } else {

    }
    // const currentIdToken = idToken;
    // const expirationTime = expiresIn;

    // // Check if the token has expired
    // if (Date.now() >= expirationTime * 1000) {
    //   try {
    //     // If the token has expired, use the refreshToken to get a new idToken
    //     const currentRefreshToken = refreshToken;
    //     const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //       },
    //       body: `grant_type=refresh_token&refresh_token=${currentRefreshToken}`,
    //     });

    //     const tokenData = await response.json();

    //     // const newIdToken = tokenData.id_token;

    //     setIdToken(tokenData.id_token)

    //     // Use the new idToken for further requests
    //     console.log('New Token ', tokenData.id_token);

    //   } catch (error) {
    //     console.error('Error refreshing token:', error);
    //   }
    // } else {
    //   console.log('The token is still valid, proceed with the original request')
    // }
  }

  // Handles generating a new password
  const generatedRandomPassword = async () => {
    try {
      const response = await axios.get(`${API_URL}?length=17&lower=1&upper=0&int=1&special=0`);
      if (response.data && response.data.password) {
        setGeneratedPsswrd(response.data.password);
      }
    } catch (err) {
      console.log("Error generating password");
    }
  }

  useEffect(() => {
    checkTokenAndExecuteRequest();
    generatedRandomPassword();
  }, [])

  const handleNavigate = () => {
    navigation.navigate('Register')
  }


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior='padding'
    >
      <View style={styles.inputContainer}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          placeholder=" Enter your email"
          onChangeText={text => setEmail(text)}
        />
        <Text>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          placeholder=" Enter your password"
          onChangeText={text => setPassword(text)}
          secureTextEntry
        />
  
        <View style={styles.psswrdText}>
          <Text>Generated Password:</Text>
          <Text>{generatedPsswrd}</Text>
        </View>
        <View style={styles.btnSection}>
          <Pressable style={styles.button} onPress={() => handleLogin()}>
            <Text style={styles.btnText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.signupLink}>
        <Text>Don't have an account?</Text>
        <Pressable style={styles.linkButton} onPress={handleNavigate}>
          <Text style={styles.btnText}> Sign Up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDC3A5',
    alignItems: 'center',
    justifyContent: 'center'
  },

  heading: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20
  },

  inputContainer: {
    width: '80%',
  },

  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 15
  },

  buttonLogin: {
    marginTop: 20,
  },

  signupLink: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center'
  },

  btnSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  button: {
    width: 150,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },

  btnText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: '#E0A96D',
  },

  psswrdText: {
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'space-between'
  }
});

export default Login