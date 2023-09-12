import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { StyleSheet, View, Text, Image, Button, Pressable } from 'react-native';

function WelcomeScreen() {

    const navigation = useNavigation()

    const loginRoute = () => {
        navigation.navigate('Login')
    }

    const registerRoute = () => {
        navigation.navigate('Register')
    }

    return (
        <View style={styles.container}>
            <View style={styles.infoContainer}>
                {/* <Image style={styles.image} source={require('../../assets/welcomeImage.png')} /> */}
                <Text style={styles.Heading}>Welcome</Text>
                <Text style={styles.subHeading}>Please select an option to continue.</Text>
            </View>
            <View style={styles.infoButton}>
                <Pressable style={styles.button} onPress={loginRoute}>
                    <Text style={styles.text}>Sign In</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={registerRoute}>
                    <Text style={styles.text}>Sign Up</Text>
                </Pressable>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDC3A5',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -70
    },

    infoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    image: {
        width: 120,
        height: 120,
        resizeMode: 'stretch'
    },

    Heading: {
        fontSize: 35,
        marginBottom: 20,
        fontWeight: 'bold'
    },

    subHeading: {
        fontSize: 16,
        color: 'white',
        marginBottom: 20
    },

    infoButton: {
        display: 'flex',
        flexDirection: 'row',
    },

    button: {
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: 'black',
    },

    text: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: '#E0A96D',
      },
});

export default WelcomeScreen