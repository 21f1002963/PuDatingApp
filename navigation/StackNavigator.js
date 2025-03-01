import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Entypo from '@react-native-vector-icons/entypo'
import MaterialIcons from '@react-native-vector-icons/material-icons'
import Ionicons from '@react-native-vector-icons/ionicons'
import HomeScreen from '../screens/HomeScreen'
import LikesScreen from '../screens/LikesScreen'
import ChatScreen from '../screens/ChatScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { NavigationContainer } from '@react-navigation/native'

const StackNavigator = () => {
    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();

    function BottomTabs() {
        return (
            <Tab.Navigator 
            screenOptions={() => ({
                tabBarStyle: {height: 90},
                tabBarShowLabel: false,
            })}>
                <Tab.Screen name="Home" component={HomeScreen}
                    options={{
                        tabBarStyle: { backgroundColor: '#101010' },
                        headerShown: false,
                        tabBarIcon: ({ focused }) => focused ? (
                            <Ionicons name="shuffle-outline" size={30} color="white" />
                        ) :
                            (
                                <Ionicons name="shuffle-outline" size={30} color="#989898" />
                            )
                    }}
                />
                <Tab.Screen name="Likes" component={LikesScreen}
                    options={{
                        tabBarStyle: { backgroundColor: '#101010' },
                        headerShown: false,
                        tabBarIcon: ({ focused }) => focused ? (
                            <Entypo name="heart" size={30} color="white" />
                        ) :
                            (
                                <Entypo name="heart" size={30} color="#989898" />
                            )
                    }}
                />
                <Tab.Screen name="Chat" component={ChatScreen}
                    options={{
                        tabBarStyle: { backgroundColor: '#101010' },
                        headerShown: false,
                        tabBarIcon: ({ focused }) => focused ? (
                            <MaterialIcons name="chat-bubble-outline" size={30} color="white" />
                        ) :
                            (
                                <MaterialIcons name="chat-bubble-outline" size={30} color="#989898" />
                            )
                    }}
                />
                <Tab.Screen name="Profiel" component={ProfileScreen}
                    options={{
                        tabBarStyle: { backgroundColor: '#101010' },
                        headerShown: false,
                        tabBarIcon: ({ focused }) => focused ? (
                            <Ionicons name="person-circle-outline" size={30} color="white" />
                        ) :
                            (
                                <Ionicons name="person-circle-outline" size={30} color="#989898" />
                            )
                    }}
                />
            </Tab.Navigator>
        );
    }

    const AuthStack=() => {
        return (
            <Stack.Navigator>
                <Stack.Screen name="Login" component={LoginScreen}
                    options={{
                        headerShown: false
                    }}
                />
            </Stack.Navigator>
        )
    }

    function MainStack() {
        return (
            <Stack.Navigator>
                <Stack.Screen name="Main" component={BottomTabs}
                    options={{
                        headerShown: false
                    }}
                />
            </Stack.Navigator>
        );
    }

    return (
        <NavigationContainer>
            <MainStack />
        </NavigationContainer>
    )
}

export default StackNavigator