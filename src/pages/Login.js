import React, { useEffect, useState } from 'react'
import { Text, View, TextInput, StyleSheet, KeyboardAvoidingView, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getAuth, onAuthStateChanged } from "firebase/auth";

const apiKey = 'AIzaSyBJM9aNj0Gh1kLLmpsHf9aTzVVW96oTKEA';
const API_URL = 'https://www.psswrd.net/api/v1/password/';

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idToken, setIdToken] = useState('');
  // const [expiresIn, setExpiresIn] = useState('');
  // const [refreshToken, setRefreshToken] = useState('');
  const [userData, setUserData] = useState('');
  const [errorMessage,setErrorMessage] = useState('')

  const navigation = useNavigation() // handles the nagivation to another screen

  // Handles the login function
  const handleLogin = async () => {

    if(!email || !password){
      setErrorMessage('email and password required.');
      return;
    }

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

      if (data.idToken) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
        navigation.navigate("Home/:user", { user: data });
        return data;
        // await AsyncStorage.setItem('userToken', data.idToken);
        // await AsyncStorage.setItem('expiresIn', data.expiresIn.toString());
        // await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
    } catch (err) {
      console.log('Login Failed: ', err)
    }
  }

  async function getUserInfo(token) {
    try {
      const response = await fetch('https://your-api-endpoint/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        // You might need to adjust the endpoint and headers based on your API
      });

      if (response.ok) {
        const userInfo = await response.json();
        return userInfo;
      } else {
        throw new Error('Failed to fetch user information');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }


  useEffect(() => {
    const checkTokenAndExecuteRequest = async () => {

      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        const userInfo = JSON.parse(userInfoString);

        if (userInfo) {
          setUserData(userInfo)
          navigation.navigate("Home/:user", { user: userInfo });
        } else {
          console.log('Error fetching user data: ', error);
        }
      } catch (error) {
        console.log('Error fetching user data: ', error);
      }
    }
    checkTokenAndExecuteRequest();
  }, []);

  const handleNavigate = () => {
    navigation.navigate('Register');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior='padding'
    >
      <View style={styles.inputContainer}>
        {errorMessage && (<Text style={{color:'red'}} className="error"> {errorMessage} </Text>)}
        <Text style={{width:'90%'}}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          placeholder=" Enter your email"
          onChangeText={text => setEmail(text)}
        />
        {}
        <Text style={{width:'90%'}}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          placeholder=" Enter your password"
          onChangeText={text => setPassword(text)}
          secureTextEntry
        />
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
    width: '100%',
    justifyContent:'center',
    alignItems:'center'
  },

  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 15,
    width:"90%"
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