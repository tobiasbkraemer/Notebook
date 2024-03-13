import { app, database } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View, Alert, TouchableOpacity, Image} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker'
import { storage } from './firebase'
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {useCollection} from 'react-firebase-hooks/firestore'

const Stack = createStackNavigator();

function DetailScreen({ route, navigation }) {
  const { buttonText } = route.params;
  const [editedText, setEditedText] = useState(buttonText);
  const homeNavigation = useNavigation(); 

  const updateButton = () => {
    homeNavigation.setParams({ updatedText: editedText }); 
    navigation.goBack(); 
  }; 

  return (
    
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={text => setEditedText(text)}
        value={editedText}
      />
      <Button title="Update Button Text" onPress={updateButton} />
    </View>
  );
}

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ route }) {
  const [inputText, setInputText] = useState('');
  const [buttonList, setButtonList] = useState([]);
  const navigation = useNavigation();
  const { updatedText } = route.params || {};
  const [imagePath, setImagePath] = useState(null)

  useEffect(() => {
    // Hent noter fra Firebase, når komponenten indlæses
    fetchNotesFromFirebase();
  }, []);

  useEffect(() => {
    if (updatedText) {
      setButtonList(prevButtonList => prevButtonList.map(buttonText => buttonText === buttonText ? updatedText : buttonText));
    }
  }, [updatedText]);

  // Funktion til at hente noter fra Firebase
  const fetchNotesFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(database, 'notes'));
      const notes = [];
      querySnapshot.forEach((doc) => {
        notes.push({ id: doc.id, text: doc.data().text });
      });
      setButtonList(notes);
    } catch (error) {
      console.error('Error fetching notes: ', error);
    }
  };

  // Funktion til at tilføje en note til Firebase og listen
  const addNoteToFirebase = async (text) => {
    try {
      const docRef = await addDoc(collection(database, "notes"), {
        text: text
      });
      console.log("Note written with ID: ", docRef.id);
      setButtonList(prevButtonList => [...prevButtonList, { id: docRef.id, text: text }]);
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  // Funktion til at slette en note fra Firebase og listen
  const deleteNote = async (id) => {
    try {
      // Slet note fra Firebase
      await deleteDoc(doc(database, 'notes', id));
      // Opdater buttonList, fjern den slettede note
      setButtonList(prevButtonList => prevButtonList.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note: ', error);
    }
  };

  async function launchImagePicker() {
    let result = await ImagePicker.launchImageLibraryAsync ({
      allowsEditing: true

    })
    if(!result.canceled) {
      setImagePath(result.assets[0].uri)
    }
  }

  async function launchCamera () {
    const result = await ImagePicker.requestCameraPermissionsAsync()
    if(result.granted===false) {
      alert("Camera access not provided")
    } else {
      ImagePicker.launchCameraAsync ({
        quality:1
      })
      .then((response) => {
        if(!response.canceled) {
          setImagePath(response.assets[0].uri)
        }
      })
      .catch((error) => alert("fejl i camera "+error))
    }
  }

  async function uploadImage () {
    const res = await fetch(imagePath)
    const blob = await res.blob()
    const storageRef = ref(storage, "myimage.jpg")
    uploadBytes(storageRef, blob).then((snapshot) => {
      alert("image uploaded")
    })
  }
  
  async function downloadImage () {
    getDownloadURL(ref(storage,"myimage.jpg"))
    .then((url) => {
      setImagePath(url)
    })
  }

  const addButton = () => {
    if (inputText.trim()) {
      addNoteToFirebase(inputText.trim());
      setInputText('');
    }
  };

  const goToDetailScreen = (text) => {
    navigation.navigate('Detail', { buttonText: text });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonList}>
        {buttonList.map((note, index) => (
          <View key={note.id} style={styles.noteContainer}>
            <TouchableOpacity onPress={() => goToDetailScreen(note.text)}>
              <Text style={styles.buttonText}>{note.text.length > 30 ? note.text.substring(0, 30) + '...' : note.text}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteNote(note.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TextInput
        placeholder="Enter button text"
        onChangeText={text => setInputText(text)}
        value={inputText}
        style={styles.input}
      />
      {updatedText && <Text style={styles.updatedText}>Button text updated: {updatedText}</Text>}
      <View style={styles.buttonContainer}>
        <Button title="Add Button" onPress={addButton} />
      </View>

      <Image  style={{width:200, height:200}} source={{uri:imagePath}} />

      <Button title ='Pick image' onPress={launchImagePicker}/>
      <Button title ='Camera' onPress={launchCamera}/>
      <Button title ='Upload image' onPress={uploadImage}/>
      <Button title ='Download image' onPress={downloadImage}/>
 
      
      <StatusBar style="auto" />
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
  input: {
    width: '80%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonList: {
    width: '80%',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  updatedText: {
    marginBottom: 10,
  },
  noteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  deleteButtonText: {
    color: 'red',
  },
  buttonText: {
    fontSize: 16,
  },
});
