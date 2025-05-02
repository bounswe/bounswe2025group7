import {View} from 'react-native'

const Spacer = ({width = 20, height = 20}) => {
    return (
        <View style = {{width: width, height: height}}/>
    )
}

export default Spacer