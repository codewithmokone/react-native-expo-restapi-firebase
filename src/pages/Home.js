import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { Button, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'
import { auth, storage } from '../../firebaseconfig';
import { Audio } from 'expo-av';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Icon from 'react-native-vector-icons/FontAwesome';
// import RNFetchBlob from 'react-native-fetch-blob';
// import DocumentPicker from 'react-native-document-picker';

const apiKey = 'AIzaSyBJM9aNj0Gh1kLLmpsHf9aTzVVW96oTKEA';
const projectId = 'react-native-audio-recor-506b1';
const collectionName = 'recordings';

function Home({ route }) {

    const { user } = route.params;

    const [title, setTitle] = useState("");
    const [recording, setRecording] = useState('');
    const [recordings, setRecordings] = useState([]);
    const [message, setMessage] = useState("");
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userId, setUserId] = useState(user.localId);
    const [recordURL, setRecordURL] = useState('');

    const navigation = useNavigation();

    const recordingOptions = {
        isMeteringEnabled: true,
        android: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
        },
        ios: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
        },
    };

    // Handles signing out the user
    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                navigation.navigate('Login');
            })
    }

    // Handles the recording function
    async function startRecording() {
        try {

            const permission = await Audio.requestPermissionsAsync();

            if (permission.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });

                const { recording } = await Audio.Recording.createAsync(
                    recordingOptions
                );

                setRecording(recording);
            } else {
                setMessage("Please grant permission to app to access microphone");
            }
        } catch (err) {
            console.log("Failed to start recording", err)
        }
    }

    // Handles aving the recording to firebase
    async function stopRecording() {

        try {
            setRecording(undefined);
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            const { sound, status } = await recording.createNewLoadedSoundAsync();

            const audioFile = await recording.getURI();
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    try {
                        resolve(xhr.response);
                    } catch (error) {
                        console.log("error:", error);
                    }
                };
                xhr.onerror = (e) => {
                    console.log(e);
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", audioFile, true);
                xhr.send(null);
            });

            if (blob != null) {

                const storageBucket = 'react-native-audio-recor-506b1.appspot.com';
                const apiUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o?name=${encodeURIComponent(title)}`;

                const formData = new FormData();
                formData.append('audio', blob);

                const storageRef = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                });

                if (storageRef) {
                    const data = await storageRef.json();
                    if (data && data.downloadTokens) {
                      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(title)}?alt=media&token=${data.downloadTokens}`;
                      setRecordURL(downloadUrl);
                      console.log('File uploaded successfully. Download URL:', downloadUrl);
                    } else {
                      console.error('Failed to get download URL from Firebase Storage response');
                    }
                  } else {
                    console.error('File upload failed');
                  }

                // Saving the data to firebase storage
                const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?&key=${apiKey}`;
                const recordData = {
                    "fields": {
                        "duration": {
                            "stringValue": `${getDurationFormatted(status.durationMillis)}`
                        },
                        "userId": {
                            "stringValue": `${user.localId}`
                        },
                        "title": {
                            "stringValue": `${title}`
                        },
                        "fileURL": {
                            "stringValue": `${recordURL}`
                        }
                    }
                }

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(recordData),
                });

                const recordedData = await response.json();

                let updatedRecordings = [
                    ...recordings,
                    {
                        sound: sound,
                        duration: getDurationFormatted(status.durationMillis),
                        file: audioFile,
                        title: title,
                    }
                ];

                setRecordings(updatedRecordings);
                setRecording(null)
                setTitle('')
            }
        } catch (err) {
            console.log(err)
        }
    }

    // Handles the recording duration
    function getDurationFormatted(millis) {
        const minutes = millis / 1000 / 60;
        const minutesDisplay = Math.round(minutes);
        const seconds = Math.round((minutes - minutesDisplay) * 60);
        const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
        return `${minutesDisplay}:${secondsDisplay}`;
    }

    // Handles the stored recordings view
    function getRecordingLines() {

        if (!recordings) {
            return <Text>No recordings availabe</Text>
        } else {
            return recordings.map((recordingLine, index) => {

                const sound = new Audio.Sound();

                // Handles the play function
                const handlePlay = async () => {
                    if (!isPlaying) {
                        try {
                            setIsPlaying(true)
                            await sound.loadAsync({ uri: recordingLine.fileURL.stringValue })
                            await sound.playAsync();
                            sound.setOnPlaybackStatusUpdate(status => {
                                if (status.didJustFinish) {
                                    setIsPlaying(false);
                                }
                            });
                        } catch (err) {
                            console.log('Error playing audio', err);
                            setIsPlaying(false);
                        }
                    }
                }

                return (
                    <View key={index} style={styles.row}>
                        <Text style={styles.fill}>{recordingLine.normalObject.title} - {recordingLine.normalObject.duration}</Text>
                        <Pressable style={styles.btnEdit} onPress={handlePlay}>
                            <Icon name="play" size={20} color="#E0A96D" />
                        </Pressable>
                        <View style={styles.btnEdit}>
                            {
                                editingIndex === index ? (
                                    <View>
                                        <Pressable onPress={() => updateRecording(index)}>
                                            <Icon name="save" size={20} color="#E0A96D" />
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View>
                                        <Pressable onPress={() => editRecordingName(index)}>
                                            <Icon name="edit" size={20} color="#E0A96D" />
                                        </Pressable>
                                    </View>
                                )
                            }
                        </View>

                        <Pressable style={styles.btnDelete} onPress={() => deleteRecording(index)}>
                            <Icon name="remove" size={20} color="#E0A96D" />
                        </Pressable>
                    </View>
                );
            });
        }
    }

    // Handles the edit functionality
    function editRecordingName(index) {
        setEditingIndex(index);
        setTitle(recordings[index].title.stringValue);
    }

    // Handles the update functionality
    async function updateRecording(index) {

        const recording = recordings[index];

        try {
            const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${recording.id}?currentDocument.exists=true&updateMask.fieldPaths=title&alt=json`
            const updatedData = {
                fields: {
                    title: {
                        stringValue: `${title}`
                    },
                }
            };

            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response) {
                const updatedRecordings = [...recordings];
                updatedRecordings[index].fields.title.stringValue = title;
                setRecordings(updatedRecordings);
                setEditingIndex(-1); // Reset editing state
                console.log('Title updated');
            } else {
                console.log('Failed to update title')
            }
        } catch (err) {
            console.log("Error renaming audio:", err)
        }
    }

    // Handles the delete recording function
    async function deleteRecording(index) {
        console.log("userId", userId)
        const recordingToDelete = recordings[index];
        console.log("Recording to be delete: ", recordingToDelete.id)

        try {
            const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${recordingToDelete.id}?key=${apiKey}`;
            // const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/3L4rZmt4G6RieXrYz3H9?key=${apiKey}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response) {
                console.log('Recording has been deleted from firestore');

                const audioFileRef = ref(storage, `audio/${userId}/${recordingToDelete.normalObject.title}`)
                await deleteObject(audioFileRef);
                console.log('Recording deleted from storage')

                const updatedRecordings = [...recordings];
                updatedRecordings.splice(title, 1);
                setRecordings(updatedRecordings);
            } else {
                console.log('Failed to delete recordings')
            }

        } catch (err) {
            console.log('Error deleting document ', err)
        }
    }

    // Loading the recording from Firebase Firestore
    async function loadRecordings() {

        if (userId) {
            try {
                const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?key=${apiKey}`;
                const response = await fetch(endpoint);
                const responseData = await response.json();
                const documents = responseData.documents || [];
                const recordingsArray = []

                documents.forEach(document => {
                    const data = document.fields; // Assuming data is stored in "fields"
                    const parts = document.name.split('/');
                    const id = parts[parts.length - 1]; // The last part is the document ID
                    let normalObject = {}
                    for (let key in data) {
                        normalObject = { ...normalObject, [key]: data[key].stringValue }
                    }
                    recordingsArray.push({ id: id, normalObject })
                });

                setRecordings(recordingsArray);

            } catch (err) {
                console.error('Error fetching Firestore data: ', err);
            }
        } else {
            return <Text>Please login to see the recordings</Text>
        }
    }

    useEffect(() => {

        if (userId) {
            // Load saved recordings when the components mount
            loadRecordings();
        }

    }, [userId, recordings])

    return (
        <SafeAreaView>

            <View style={styles.container}>
                <View style={styles.userInfo} >
                    <Text style={styles.userInfoText}><Icon name="user" size={20} color='#E0A96D' /> : {user.email}</Text>
                    <Text style={styles.userInfoButton} onPress={handleSignOut}>Log Out</Text>
                </View>
                <View style={styles.headingContainer}>
                    <Text>Press start to record your message.</Text>

                    <Text>{message}</Text>

                    <Text style={styles.recordingTitle}>Recording title:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder=' Recording Title'
                        value={title}
                        onChangeText={setTitle}
                    />
                    <Button
                        title={recording ? 'Stop Recording' : 'Start Recording'}
                        onPress={recording ? stopRecording : startRecording}
                    />
                </View>
                <View style={styles.inputSection}>

                </View>
                <View >
                    {getRecordingLines()}
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#DDC3A5'
    },

    userInfo: {
        width: 390,
        height: 40,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    userInfoText: {
        color: '#E0A96D',
        margin: 5,
    },

    userInfoButton: {
        color: '#E0A96D',
        marginRight: 10,
    },

    headingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30
    },

    recordingTitle: {
        margin: 10,
        fontWeight: 'bold'
    },

    input: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'ivory',
        width: 200,
        height: 30,
        marginBottom: 10
    },

    row: {
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 350,
        margin: 5,
        borderRadius: 5,
    },

    fill: {
        flex: 1,
        margin: 16,
        color: '#E0A96D',
    },

    button: {
        width: 10,
        margin: 16,
    },

    inputSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },

    signoutButton: {
        marginTop: 100,
    },

    btnEdit: {
        marginLeft: 20,
        marginRight: 20,
    },

    btnDelete: {
        marginRight: 20,
    }
})

export default Home