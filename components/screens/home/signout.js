import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import {
    withNavigationFocus,
    NavigationActions,
    StackActions    
} from 'react-navigation';
import AntDesign from 'react-native-vector-icons/AntDesign';

import firebase from 'react-native-firebase';

class SignOut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
        this.signOut = this.signOut.bind(this);
    }

    async signOut() {
        firebase.auth().signOut()
        .then(() => {
          console.log('Signed Out');
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Loading' })],
        });
        this.props.navigation.dispatch(resetAction);    
        })
        .catch(e=>{
         console.error('Sign Out Error', e);
        });
    }

    alertOption() {
        Alert.alert("Sign Out", "Are you sure?", [
            { text: "NO", style: "cancel" },
            { text: "YES", onPress: this.signOut }
        ]);
    }
    
    render() {
        return (
            <TouchableOpacity
                onPress={this.alertOption}
            >
                <AntDesign 
                    name='logout'
                    size={25}
                    color='#fff'
                />
            </TouchableOpacity>            
        )
    }
}

export default withNavigationFocus(SignOut);