import React, { useState } from 'react';
import { Text, View, TextInput, StyleSheet, KeyboardAvoidingView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';


function Register() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation = useNavigation();

    const handleRegister = async () => {
        
        const apiKey = 'AIzaSyBJM9aNj0Gh1kLLmpsHf9aTzVVW96oTKEA';

        const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
        const userData = {
            email,
            password,
            returnSecureToken: true,
        }

        try{
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            navigation.navigate('Login');
            return data
        }catch(err){
            console.log('Error creating user: ', err)
        }
    }

    const handleNavigate = () => {
        navigation.navigate('Login');
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior='padding'
        >
            <View>
            </View>
            <View style={styles.inputSection}>
                <Text>Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder=" Enter your name"
                    onChangeText={text => setName(text)}
                />
                <Text>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder=" Enter your email"
                    onChangeText={text => setEmail(text)}
                />
                <Text>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder=" Enter your password"
                    onChangeText={text => setPassword(text)}
                />
                <View style={styles.btnSection}>
                    <Pressable style={styles.button} onPress={handleRegister}>
                        <Text style={styles.btnText}>Sign Up</Text>
                    </Pressable>
                </View>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.signinLink}>Already Have a account?</Text>
                <Pressable style={styles.linkButton} onPress={handleNavigate}>
                    <Text style={styles.btnText}> Sign In</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#588157',
        alignItems: 'center',
        justifyContent: 'center'
    },

    heading: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 20
    },

    inputSection: {
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
        marginTop: 30,
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

});

export default Register