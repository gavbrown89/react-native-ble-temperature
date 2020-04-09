import React from 'react';
import {
    Dimensions,
    View,
    StyleSheet
} from 'react-native';
import {
    createSwitchNavigator,
    createAppContainer
} from 'react-navigation';
import {
    createStackNavigator
} from 'react-navigation-stack';

// Import screens
import Loading from '../screens/loading/index';
import SignIn from '../screens/signin/index';
import Register from '../screens/register/index';
import Home from '../screens/home/index';

export const InitialRoutes = createStackNavigator ({
    Loading: {
        screen: Loading,
        navigationOptions: () => ({
            drawerLabel: () => null,
            header: null,
            gestureEnabled: false,
        }),
    },    
    SignIn: {
        screen: SignIn,
        navigationOptions: () => ({
            drawerLabel: () => null,
            header: null,
            gestureEnabled: false,
        }),
    },
    Register: {
        screen: Register,
        navigationOptions: () => ({
            drawerLabel: () => null,
            header: null,
            gestureEnabled: false,
        }),
    },
    Home: {
        screen: Home,
        navigationOptions: () => ({
            drawerLabel: () => null,
            header: null,
            gestureEnabled: false,
        }),
    },    
},
{
    initialRouteName: 'Loading',
},
);

const Routes = createAppContainer(InitialRoutes);

export default Routes;