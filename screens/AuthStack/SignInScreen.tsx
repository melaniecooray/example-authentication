import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, ScrollView, Text } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { AuthStackParamList } from "./AuthStackScreen";
import firebase from "firebase";

interface Props {
  navigation: StackNavigationProp<AuthStackParamList, "SignInScreen">;
}

export default function SignInScreen({ navigation }: Props) {
  /* Screen Requirements:
      - AppBar
      - Email & Password Text Input
      - Submit Button
      - Sign Up Button (goes to Sign Up screen)
      - Reset Password Button
      - Snackbar for Error Messages
  
    All UI components on this screen can be found in:
      https://callstack.github.io/react-native-paper/

    All authentication logic can be found at:
      https://firebase.google.com/docs/auth/web/starts
  */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const onDismissSnackBar = () => setVisible(false);
  const showError = (error: string) => {
    setMessage(error);
    setVisible(true);
  };

  const saveEvent = async () => {
    if (!email) {
      showError("Please enter an email.");
      return;
    } else if (!password) {
      showError("Please enter a password.");
      return;
    } else {
      setLoading(true);
    }
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in 
      var user = userCredential.user;
      setLoading(false);
    })
    .catch((error) => {
      setLoading(false);
      showError(error.message);
    });
  };

  const resetPassword = () => {
    if (!email) {
      showError("Please enter an email.");
      return;
    } else {
      setResetLoading(true);
    }

    firebase.auth().sendPasswordResetEmail(email).then(function() {
      setResetLoading(false);
      showError("Reset password email was sent.");
    }).catch(function(error) {
      showError(error.message);
    });
  }

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="Socials" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <>
      <Bar />
      <SafeAreaView style={{ ...styles.container, padding: 20 }}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={(name: any) => setEmail(name)}
          style={{ backgroundColor: "white", marginBottom: 10 }}
        />
        <TextInput
          label="Password"
          value={password}
          secureTextEntry={true}
          onChangeText={(location: any) => setPassword(location)}
          style={{ backgroundColor: "white", marginBottom: 10 }}
        />
        <Button
          mode="contained"
          onPress={saveEvent}
          style={{ marginTop: 20 }}
          loading={loading}
        >
          Sign In
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("SignUpScreen")}
          style={{ marginTop: 20 }}
        >
          Go to Sign Up
        </Button>
        <Button
          mode="outlined"
          onPress={resetPassword}
          style={{ marginTop: 20 }}
          loading={resetLoading}
        >
          Reset Password
        </Button>
        <Snackbar
          duration={3000}
          visible={visible}
          onDismiss={onDismissSnackBar}
        >
          {message}
        </Snackbar>
      </SafeAreaView>
    </>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: "#ffffff",
  },
});
