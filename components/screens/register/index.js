import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ImageBackground,
    Image,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import {
    withNavigationFocus
} from 'react-navigation';
import {
    Input,
    Button
} from 'react-native-elements';
import firebase from 'react-native-firebase';

import backgroundImg from '../../assets/images/signin-bg.jpg';
import Logo from '../../assets/images/logo.png';

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            errorMessage: null,
        }
    }
    switchForm = () => {
        this.props.navigation.navigate('SignIn');
    }    
    handleRegistration = () => {
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(() => this.props.navigation.navigate('Home'))
        .catch(error => this.setState({ errorMessage: error.message }))
    }
    render() {
        return (
            <ImageBackground source={backgroundImg} style={styles.imageBackground}>
                <StatusBar hidden={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                    <Image source={Logo} style={{ resizeMode: 'contain', width: 100, height: 100}} />
                    <Text style={{ fontFamily: 'Montserrat'}}>
                        BLE Temperature
                    </Text>
                    <Text style={{ fontFamily: 'Montserrat', fontSize: 10}}>
                        Create an account
                    </Text>                    
                    {this.state.errorMessage &&
                    <Text style={{color: 'red'}}>
                        {this.state.errorMessage}
                    </Text>
                    }
                </View>
                <View style={styles.formContainer}>
                    <Input 
                        style={styles.inputField}
                        inputContainerStyle={{ marginBottom: 10}}
                        inputStyle={{ fontSize: 12, fontFamily: 'Montserrat'}}
                        placeholder='Email'
                        autoCapitalize = 'none'
                        onChangeText={email => this.setState({ email })}
                        value={this.state.email}
                    />                    
                    <Input 
                        style={styles.inputField}
                        inputContainerStyle={{ marginBottom: 20}}      
                        inputStyle={{ fontSize: 12, fontFamily: 'Montserrat'}}                 
                        placeholder='Password'
                        autoCapitalize = 'none'
                        secureTextEntry = {true}
                        onChangeText={password => this.setState({ password })}
                        value={this.state.password}                        
                    />     
                    <Button 
                        title='Register'
                        titleStyle={{ fontFamily: 'Montserrat' }}                        
                        buttonStyle={{ borderRadius: 20, backgroundColor:'#2db9ea'}}
                        containerStyle={{ paddingLeft: 30, paddingRight: 30}}
                        onPress={this.handleRegistration}
                    />   
                    <View>
                        <TouchableOpacity style={{ marginTop: 30}}
                            onPress={this.switchForm}
                        >
                            <Text style={{ textAlign: 'center', color: '#e5d82e', fontFamily: 'Montserrat'}}>
                                Already have an account?
                            </Text>
                        </TouchableOpacity>
                    </View>            
                </View>
            </ImageBackground>
        )
    }
}

export default withNavigationFocus(Register);

const styles = StyleSheet.create({
    imageBackground: {
        flex: 1,
    },
    formContainer: {
        flex: 1,
        paddingLeft: 30,
        paddingRight: 30
    }
})