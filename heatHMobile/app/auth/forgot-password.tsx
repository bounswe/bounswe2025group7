import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Spacer from '@/components/ui/Spacer'
import {Platform, KeyboardAvoidingView, ScrollView} from "react-native";
import {useState} from "react";

export default function ForgotPasswordScreen() {

    const [email, setEmail] = useState('');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <Spacer/>
            <ScrollView contentContainerStyle={{justifyContent: "center", padding: 20, flexGrow: 1}}>
                <ThemedView style={{padding: 20}}>
                    <Spacer/>
                    <ThemedText type={"title"} style={{flex: 1, justifyContent: "center"}}>Forgot Password</ThemedText>
                    <Spacer/>
                    <Input
                        placeholder={"Email address*"}
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Spacer/>
                    <Button title={"Send Verification Code"}/>
                    <Spacer/>
                    <Button title={"Back to Sign in"}/>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>

    );
}


