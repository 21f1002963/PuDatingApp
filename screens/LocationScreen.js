import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import { PermissionsAndroid } from 'react-native';
import React, { useEffect } from 'react'
import { GOOGLE_MAPS_API_KEY } from '@env'
import { Alert } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Image } from 'react-native'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker } from 'react-native-maps'
import { useNavigation } from '@react-navigation/native'
import { saveRegistrationProgress } from '../utils/registrationUtils'

const LocationScreen = () => {
  const navigation = useNavigation();
  const [region, setRegion] = React.useState('')
  const [location, setLocation] = React.useState('Loading...')

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords
                console.log(latitude, longitude)
                const initailRegion = {
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01
                } 
                console.log(initailRegion)

                setRegion(initailRegion)

                fetchAddress(latitude, longitude)
            },
            error => Alert.alert('Error', JSON.stringify(error)),
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 1000,
            },
          );
        } else {
          Alert.alert('Location Permission Denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();
  }, []);

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        let formatted_address = '';
        for (let i = 0; i < addressComponents.length; i++) {
          if (addressComponents[i].types.includes('sublocality_level_1')) {
            formatted_address += addressComponents[i].long_name + ', ';
          }
          if (addressComponents[i].types.includes('locality')) {
            formatted_address += addressComponents[i].long_name + ', ';
          }
        }
        formatted_address = formatted_address.trim().slice(0, -1);
        setLocation(formatted_address);
      } else {
        setLocation('Address not found');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setLocation('Error loading address');
    }
  };

  const handleNext = () => {
    saveRegistrationProgress('location', location)
    navigation.navigate('Gender')
  }

  return (
    <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? 50 : 0, flex: 1, backgroundColor: 'white' }}>
      <View style={{ marginTop: 80, marginHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
            <MaterialDesignIcons name="map-marker" size={26} color="black" />

          </View>
          <Image style={{ width: 100, height: 40 }}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png'
            }}>
          </Image>
        </View>

        <Text style={{
          fontSize: 25, fontWeight: 'bold', fontFamily: 'GeezaPro-Bold'
        }}> Where do you live?
        </Text>

        <MapView
          region={region}
          style={{ width: '100%', height: 500, marginTop: 20, borderRadius: 5 }}>
            { region && (
              <Marker coordinate={{
                latitude: region.latitude,
                longitude: region.longitude
              }}>
                <View style={{ backgroundColor: 'black', padding: 12, borderRadius: 30 }}>
                  <Text style={{ color: 'white', fontWeight: '500',
                    fontSize: 14, fontFamily: 'GeezaPro-Bold', textAlign: 'center'
                   }}>
                    {location}
                  </Text>
                </View>
              </Marker>
            )}
          </MapView>

        <TouchableOpacity
          onPress={handleNext}
          style={{ marginTop: 30, marginLeft: 'auto', flexDirection: 'row', 
           }} // Added flexDirection and alignItems
        >
          <View style={styles.circle}>
            <Text style={styles.arrow}>></Text> {/* Using a right arrow character */}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default LocationScreen

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 30,
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10, // Add some padding for better touch area
},
circle: {
    width: 50, // Slightly larger
    height: 50, // Slightly larger
    borderRadius: 25, // Half of width/height
    backgroundColor: '#581845',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Add shadow for depth (Android)
    shadowColor: '#000', // Add shadow for depth (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
},
arrow: {
    color: 'white',
    fontSize: 32, // Slightly larger
    fontWeight: '600', // Slightly bolder
    marginLeft: 2,
    textAlign: 'center', // Added textAlign: 'center'
    width: '100%',
    lineHeight: 32,
    paddingTop: 2, // Slight adjustment for visual centering
},
})