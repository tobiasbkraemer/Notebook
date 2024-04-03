import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, TextInput, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'
import { storage } from '../firebase/firebaseConfig'
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location'

const DetailScreen = ({ route, navigation }) => {
  const { noteId, buttonText } = route.params;
  const [editedText, setEditedText] = useState(buttonText);
  const homeNavigation = useNavigation(); 
  const [imagePath, setImagePath] = useState(null)
  const [markers, setMarkers] = useState([])
  const [region, setRegion] = useState({
    latitude:55,
    longitude:12,
    latitudeDelta:20,
    longitudeDelta:20
  })

  const updateButton = () => {
    homeNavigation.setParams({ updatedText: { id: buttonText.id, text: editedText } }); 
    navigation.goBack(); 
  };  
  
  const mapView = useRef(null)
  const locationSubscription = useRef(null)

  useEffect(() => {
    async function startListening () {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        alert('ingen adgang til lokation')
        return
      }
      locationSubscription.current = await Location.watchPositionAsync ({
        distanceInterval: 100,
        accuracy: Location.Accuracy.High
        
      }, (lokation) => {
        const newRegion = {
          latitude:lokation.coords.latitude,
          longitude:lokation.coords.longitude,
          latitudeDelta:20,
          longitudeDelta:20
        }
        setRegion(newRegion) // flytter kortet til den nye lokation
        if (mapView.current) {
          mapView.current.animateToRegion(newRegion)
        }
      })
    }
    startListening()
    return () => {
      if(locationSubscription.current) {
        locationSubscription.current.remove()
      }
    }
  
  },[])

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

  function addMarker (data) {
    const{latitude, longitude } = data.nativeEvent.coordinate
    const newMarker = {
      coordinate: {latitude, longitude},
      key: data.timeStamp,
      title:"Great place"
    }
    setMarkers([...markers,newMarker])
  }

  function onMarkerPressed (text) {
    alert("you pressed "+ text)
  }

  return (
    <View style={styles.container}>
      
      <Image  style={{width:200, height:200}} source={{uri:imagePath}} />
      
      <TextInput
        style={styles.input}
        onChangeText={text => setEditedText(text)}
        value={editedText}
      />
      <Button title="Update Button Text" onPress={updateButton} />
      <Button title ='Pick Button Image' onPress={launchImagePicker}/>
      <Button title ='Upload Button Image' onPress={uploadImage}/>
      <Button title ='Download Button Image' onPress={downloadImage}/>
      <Button title ='Camera' onPress={launchCamera}/>

      <MapView 
      style={styles.map}
      region={region}
      onLongPress={addMarker}
      >
        {markers.map(marker => (
          <Marker 
          coordinate={marker.coordinate}
          key={marker.key}
          title={marker.title}
          onPress={() => onMarkerPressed(marker.title)}
          />
        ))
        }
      </MapView>

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
  map: {
    width:'80%',
    height:'40%'
  },
});

export default DetailScreen;
