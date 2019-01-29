import React,{Component} from 'react'
import {Image,Text,TouchableOpacity,View} from 'react-native'
export default class App extends Component {
  constructor() { 
    super()
    this.total = 0
    this.product = [ { name: 'Latte', price: 80 }, 
                     { name: 'Mocha', price: 90 },
                     { name: 'Espresso', price: 70 } ]
  }
  add(x) { 
    this.total = this.total + x
    this.forceUpdate()
  }
  render() {
    return <View>
        {this.product.map( (v,i) => <View style={{padding: 4, paddingBottom:0,
                 flexDirection:'row', justifyContent:'space-between'}}>
          <View style={{flexDirection:'row'}}>
            <Image source={{uri:'https://codestar.work/codestar.png'}} 
                  style={{width:40, height:40}} />
            <View style={{marginLeft:4}}>
              <Text>{v.name}</Text>
              <Text style={{color:'gray'}}>{v.price}</Text>
            </View>
          </View>
          <TouchableOpacity style={{float:'right'}}
            onPress={ () => this.add( v.price ) }>
            <Text>Buy</Text>
          </TouchableOpacity>
        </View>)}
        <Text>Total {this.total}</Text>
    </View>
  }
}

// https://github.com/kookiatsuetrong/january
