import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { app, database } from '../firebase/firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword} from "firebase/auth"
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence, signOut } from 'firebase/auth';

// web 

// device
let auth
if(Platform.OS === 'web') {
    auth = getAuth(app)
}else{
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    })
}

export default function App() {
const [enteredEmail, setEnteredEmail] = useState("t@k.dk")
const [enteredPassword, setEnteredPassword] = useState("123456")
const [userId, setUserId] = useState(null)
const [enteredText, setenteredText] = useState("type here")

useEffect(()=> {
    const auth_ = getAuth()
    const unsubscribe = onAuthStateChanged(auth_, (currentUser) => {
        if(currentUser) {
            setUserId(currentUser.uid)
        }else{
            setUserId(null)
        }
    })
    return () => unsubscribe () // kaldes når componenten unmountes.
}, [])


async function addDocument(){
    try{
        await addDoc(collection(database, userId),{
            text:enteredText
        })
    }catch(error){
        console.log("error addDocument " + error)
    }
}

async function login(){
    
    try{
        const userCredential = await signInWithEmailAndPassword(auth,enteredEmail,enteredPassword)
        console.log("logged ind " + userCredential.user.uid)
    }catch(error){}
}


async function signup(){
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, enteredEmail, enteredPassword)
        console.log("oprettet ny bruger " + userCredential.user.uid)
    } catch (error) {}
}

async function sign_out() {
    await signOut(auth)
}


return (
<View style={styles.container}>

{ !userId &&
<>
<Text>Login</Text>
<TextInput
onChangeText={newText => setEnteredEmail(newText)}
value={enteredEmail}
/>
<TextInput
onChangeText={newText => setEnteredPassword(newText)}
value={enteredPassword}
/>
<Button
title='Log in'
onPress={login}
/>

<TextInput
onChangeText={newText => setEnteredEmail(newText)}
value={enteredEmail}
/>
<TextInput
onChangeText={newText => setEnteredPassword(newText)}
value={enteredPassword}
/>
<Button
title='Signup'
onPress={signup}
/>
</>
}

{ userId &&
<>
<TextInput
onChangeText={newText => setenteredText(newText)}
value={enteredText}
/>
<Button
title='Add new Document'
onPress={addDocument}
/>

<Button
title='Sign out'
onPress={sign_out}
/>
</>
}

</View>
);

}


const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
alignItems: 'center',
justifyContent: 'center',
},
});
