import axios from 'axios';
// import firebase from './firebaseConfig';

const databaseURL = 'https://react-native-audio-recor-506b1.firebaseio.com';

export const fetchData = async () => {
    try{
        const response = await axios.get(`${databaseURL}/recordings`);
        return response.data;
    }catch(err){
        console.log('Error fetching data', err)
    }
}