import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { database } from '../firebase/firebaseConfig';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen({ route }) {
    const [inputText, setInputText] = useState('');
    const [buttonList, setButtonList] = useState([]);
    const navigation = useNavigation();
    const { updatedText } = route.params || {};
  
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
  
  
    const addButton = () => {
      if (inputText.trim()) {
        addNoteToFirebase(inputText.trim());
        setInputText('');
      }
    };
  
    const goToDetailScreen = (text) => {
      navigation.navigate('Detail', { buttonText: text });
    };

    const goToLoginScreen = () => {
        navigation.navigate('Login');
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


        <Button title="Login" onPress={goToLoginScreen} />

        
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