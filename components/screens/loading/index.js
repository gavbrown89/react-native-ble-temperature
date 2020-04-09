import React, { Component } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import firebase from 'react-native-firebase';

class Loading extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            this.props.navigation.navigate(user ? 'Home' : 'Register')
        })
    }
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator size='large' color='#9430e2' />
            </View>
        )
    }
}

export default Loading;

const styles = StyleSheet.create({
    conatiner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})