import React,{Component} from 'react'
import {Text,TouchableOpacity,View} from 'react-native'
export default class App extends Component {
  constructor() { 
    super()
    this.total = 0
    this.product = [ { name: 'Latte', price: 80 }, { name: 'Mocha', price: 90 },
                     { name: 'Espresso', price: 70 } ]
  }
  render() {
    var item = [ ]
    return <View>{ this.product.map( (v,i) => <TouchableOpacity
                                     onPress={ () => this.add(v.price) } >
                                     <Text>{v.name}</Text></TouchableOpacity> ) }
    <Text>{this.total}</Text></View>
  }
  add(x) {
    this.total = this.total + x
    this.forceUpdate()
  }
}
