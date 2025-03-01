import { View, Text } from 'react-native'
import React from 'react'
import HomeScreen from '../screens/HomeScreen'

const StackNavigator = () => {
    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();

    function BottomTabs() {
        return (
            <Tab.Navigator>
                <Tab.Screen name="Home" component={HomeScreen}
                options={{
                    tabBarStyle: { backgroundColor: '#101010' },
                    headerShown: false,
                    tabBarIcon: ({ focused }) => focused ? (
                        <Ionicons name="shuffle-outline" size={30} color="white" />
                    ) :
                    (
                        
                    )
                }}
                />
            </Tab.Navigator>
        );
    }

    return (
        <View>
            <Text>StackNavigator</Text>
        </View>
    )
}

export default StackNavigator