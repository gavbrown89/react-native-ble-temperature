import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ImageBackground,
    TouchableOpacity,
    AppState,   
    NativeEventEmitter,    
    NativeModules,
    FlatList,
    Platform,
    PermissionsAndroid,
    Dimensions,   
} from 'react-native';
import {
    withNavigationFocus
} from 'react-navigation';
import { 
    Avatar, 
    Overlay,
    Slider,
    Input
} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import BleManager from 'react-native-ble-manager';
import { EventRegister } from 'react-native-event-listeners';
import RNBluetoothInfo from 'react-native-bluetooth-info';

import firebase from 'react-native-firebase';

import SignOut from './signout';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
var Buffer = require('buffer/').Buffer;

const dataArray = [];

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            background: '#53b1ef',
            avatarTitle: '',
            scanning:false,
            peripherals: new Map(),
            isLoading: false,    
            connectionState: '',
            disconnectDevice: false,  
            appState: '',   
            tempData: '',  
            isVisible: false,   
            threshold: 22                      
        }
        this.handleAppStateChange = this.handleAppStateChange.bind(this);      
        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);    
        this.handleStopScan = this.handleStopScan.bind(this);  
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);   
        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);                         
    }
    componentDidMount() {
        const { currentUser } = firebase.auth()

        this.setState({ currentUser })
        // const avatarLetter = this.state.currentUser.charAt(0);
        const userEmail = currentUser.email;
        this.setState({
            avatarTitle: userEmail.charAt(0).toUpperCase(),
        });
        RNBluetoothInfo.getCurrentState().then(this.handleConnection);        
        BleManager.start({showAlert: false});       
        AppState.addEventListener('change', this.handleAppStateChange); 
        this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );               
        this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
        this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );        
        this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );

        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result) {
                    console.log("Permission is OK");
                } else {
                    PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                        if (result) {
                            console.log("User accept");
                        } else {
                            console.log("User refuse");
                        }
                    });
                }
            });
        }        

    }

    handleAppStateChange(nextAppState) {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!')
            BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
                console.log('Connected peripherals: ' + peripheralsArray.length);
            });
        }
        this.setState({appState: nextAppState});
    } 
    
    handleUpdateValueForCharacteristic(data) {
        console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
        var dataValue = data.value;
        // Payload from BLE device
        var payload = new Buffer(dataValue);
        const bufferAlloc = Buffer.alloc(4, payload);
        const buffer = Buffer.from(bufferAlloc);
        const value = buffer.readFloatLE(0);
        console.log('length', Buffer.length);
        this.setState({
          tempData: value.toFixed(1),
          isLoading: false,
          disconnectDevice: true,
          peripheralID: data.peripheral,
          unsortedData: value,
        })
        dataArray.push(this.state.unsortedData);
        if (this.state.tempData >= this.state.threshold) {
            this.setState({
                background: '#d9534f'
            })
        }
    }   
    
    startScan() {
        if (!this.state.scanning) {
            this.setState({peripherals: new Map()});
            BleManager.scan([], 3, true).then((results) => {
                console.log('Scanning...');
                this.setState({
                    scanning:true,
                });
            });
        }
    }   

    retrieveConnected(){
        BleManager.getConnectedPeripherals([]).then((results) => {
            if (results.length == 0) {
                console.log('No connected peripherals')
            }
            console.log(results);
            var peripherals = this.state.peripherals;
            for (var i = 0; i < results.length; i++) {
                var peripheral = results[i];
                peripheral.connected = true;
                peripherals.set(peripheral.id, peripheral);
                this.setState({
                    peripherals
                });
            }
        });
    }    
    
    handleStopScan() {
        console.log('Scan is stopped');
        this.setState({
            scanning: false
        });
    } 
    
  //Disconnect from currently connected device
  handleDisconnectedPeripheral(data) {
        var peripherals = this.state.peripherals;
        if (this.state.counter > 0) {
        Alert.alert('Timer in progress, please wait...');
        } else {
        BleManager.disconnect(this.state.peripheralID)
            .then(() => {
                // Success code
                console.log('Disconnected');
                this.setState({
                    disconnectDevice: false,
                    tempData: '',
                    peripherals: new Map(),
                });
            })
            .catch((error) => {
            // Failure code
            console.log(error);
            });
        }
    }
    
    handleDiscoverPeripheral(peripheral){
        var peripherals = this.state.peripherals;
        console.log('Got ble peripheral', peripheral);
        if (!peripheral.name) {
            peripheral.name = 'NO NAME';
        } else {
            peripherals.set(peripheral.id, peripheral);
            this.setState({
                peripherals
            });            
        }
    }   
    
    retrieveDeviceData(peripheral) {
        this.setState({
            isLoading: true,
        });
        if (peripheral){
            if (peripheral.connected){
                BleManager.disconnect(peripheral.id);
            }else{
            BleManager.connect(peripheral.id).then(() => {
                let peripherals = this.state.peripherals;
                let p = peripherals.get(peripheral.id);
                if (p) {
                    p.connected = true;
                    peripherals.set(peripheral.id, p);
                    this.setState({
                        peripherals
                    });
                }
                console.log('Connected to ' + peripheral.id);
  
                setTimeout(() => {
  
                    BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                        console.log('peripheralInfo', peripheralInfo);
                        BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
                            console.log('Retrieved peripheral services', peripheralData);
                            BleManager.readRSSI(peripheral.id).then((rssi) => {
                                console.log('Retrieved actual RSSI value', rssi);
                            });
                            var services = peripheralData.services;
                            console.log('SERVICES', services);
                            var batteryServiceUUID = "180f";
                            var batteryCharUUID = "2a19";
                            BleManager.read(peripheral.id, batteryServiceUUID, batteryCharUUID).then((batterySt) => {
                                console.log('Battery', +batterySt);
                                this.setState({
                                    batteryStatus: batterySt
                                });
                            });
                        });
  
                        var temperatureServiceUUID = "45544942-4c55-4554-4845-524db87ad700";
                        var temperatureCharUUID = "45544942-4c55-4554-4845-524db87ad701";
                        setTimeout(()=>{
                            BleManager.startNotification(peripheral.id, temperatureServiceUUID,temperatureCharUUID).then(()=>{
                                console.log("Temperature Notification Started>>>>> on "+ peripheral.id);
                                setTimeout(()=>{
                                    BleManager.read(peripheral.id,temperatureServiceUUID,temperatureCharUUID).then((temperatureSt)=>{
                                        console.log("Temperature sensor data:"+temperatureSt);
                                    });
                                },10000);
                            })
                        },10000);
                    });
                  }, 900);
                }).catch((error) => {
                    console.log('Connection error', error);
                    this.setState({
                        isLoading: false,
                        startBtn: false,
                    });
                    Alert.alert('Connection error, please try and reconnected');
                });
            }
        }
    }
    
    renderItem(item) {
        const color = item.connected ? '#5cb85c' : '#fff';
        return (
            <TouchableOpacity onPress={() => this.retrieveDeviceData(item) }>
                <View style={[styles.row, {borderWidth: 1, borderColor: color, marginTop: 10,}]}>
                    <Text style={{fontSize: 12, textAlign: 'center', color: color, padding: 2, fontFamily: "Montserrat",}}>{item.name}</Text>
                    <Text style={{fontSize: 8, textAlign: 'center', color: color, padding: 2, fontFamily: "Montserrat",}}>{item.id}</Text>
                </View>
            </TouchableOpacity>
        );
    }    

    render() {
        const { currentUser } = this.state;
        const list = Array.from(this.state.peripherals.values());       
        return (
            <View style={[styles.container, {backgroundColor: this.state.background}]}>                
                <StatusBar hidden={true} />
                <Overlay
                    isVisible={this.state.isVisible}
                    windowBackgroundColor="#fff"
                    width={Dimensions.get('window').width}
                    height={Dimensions.get('window').height}
                    >
                    <View>
                        <TouchableOpacity
                            onPress={() => this.setState({ isVisible: false })}
                        >
                            <AntDesign 
                                name='closesquare'
                                size={20}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                        <Avatar rounded title={this.state.avatarTitle} />   
                        <Text style={{ fontFamily: 'Montserrat', fontSize: 15}}>
                            Profile
                        </Text>                      
                    </View>  
                    <View style={{ flex: 1}}>
                        <Input 
                           label='Your Email' 
                           labelStyle={{ fontFamily: 'Montserrat'}}
                           inputStyle={{ fontFamily: 'Montserrat'}}
                           disabled={true}
                           value={currentUser && currentUser.email}
                        />
                    </View>                                        
                </Overlay>               
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 5}}>
                    <TouchableOpacity style={styles.bleBtn}
                        onPress={() => this.startScan() }
                    >
                        <MaterialIcons 
                            name='bluetooth'
                            size={20}
                            color='#3B5998'
                        />
                    </TouchableOpacity>
                    <Text style={{ flex: 1, color: '#fff', fontSize: 10, textAlign: 'center'}}>
                        {currentUser && currentUser.email}
                    </Text>
                    <Avatar rounded title={this.state.avatarTitle} onPress={() => this.setState({ isVisible: true })} />
                    <View style={{ paddingLeft: 5}}>
                        <SignOut />
                    </View>
                </View>
                <View style={styles.tempDisplay}>
                    <View style={styles.tempDialOuter}>
                        <View style={styles.tempDialMiddle}>
                            <View style={styles.tempDialInner}>
                                {(this.state.tempData != '') &&
                                    <Text style={{ fontSize: 35, color: '#fff', fontFamily: 'Montserrat'}}>
                                        {this.state.tempData} {'\u2103'}
                                    </Text>                                
                                }
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1}}>
                    <View style={{ width: '100%'}}>
                        <FlatList
                            data={list}
                            renderItem={({ item }) => this.renderItem(item) }
                            keyExtractor={item => item.id}
                        />                   
                    </View>
                </View>
            </View>
        )
    }
}

export default withNavigationFocus(Home);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bleBtn: {
        width: 35, 
        height: 35, 
        borderRadius: 35/2, 
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tempDisplay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    tempDialOuter: {
        backgroundColor: 'rgba(255, 255, 255, .2)',
        width: 200,
        height: 200,
        borderRadius: 200/2,
        justifyContent: 'center',
        alignItems: 'center'        
    },
    tempDialMiddle: {
        backgroundColor: 'rgba(255, 255, 255, .3)',
        width: 180,
        height: 180,
        borderRadius: 180/2,
        justifyContent: 'center',
        alignItems: 'center'        
    },
    tempDialInner: {
        backgroundColor: 'rgba(255, 255, 255, .4)',
        width: 160,
        height: 160,
        borderRadius: 160/2,
        justifyContent: 'center',
        alignItems: 'center'  
    },
})