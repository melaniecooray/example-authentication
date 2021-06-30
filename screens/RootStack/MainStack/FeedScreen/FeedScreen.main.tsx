import React, { useState, useEffect } from "react";
import { View, FlatList, Text } from "react-native";
import { Appbar, Button, Card } from "react-native-paper";
import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../../models/social.js";
import { styles } from "./FeedScreen.styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../MainStackScreen.js";

/* 
  Remember the navigation-related props from Project 2? They were called `route` and `navigation`,
  and they were passed into our screen components by React Navigation automatically.  We accessed parameters 
  passed to screens through `route.params` , and navigated to screens using `navigation.navigate(...)` and 
  `navigation.goBack()`. In this project, we explicitly define the types of these props at the top of 
  each screen component.

  Now, whenever we type `navigation.`, our code editor will know exactly what we can do with that object, 
  and it'll suggest `.goBack()` as an option. It'll also tell us when we're trying to do something 
  that isn't supported by React Navigation!
*/
interface Props {
  navigation: StackNavigationProp<MainStackParamList, "FeedScreen">;
}

export default function FeedScreen({ navigation }: Props) {
  // List of social objects
  const [socials, setSocials] = useState<SocialModel[]>([]);

  const [likeText, setLikeText] = useState("Like");
  const [likeIcon, setLikeIcon] = useState('heart-outline');

  const currentUserId = firebase.auth().currentUser!.uid;

  useEffect(() => {
    const db = firebase.firestore();
    const unsubscribe = db
      .collection("socials")
      .orderBy("eventDate", "asc")
      .onSnapshot((querySnapshot: any) => {
        var newSocials: SocialModel[] = [];
        querySnapshot.forEach((social: any) => {
          const newSocial = social.data() as SocialModel;
          newSocial.id = social.id;
          newSocials.push(newSocial);
        });
        setSocials(newSocials);
      });
    return unsubscribe;
  }, []);

  const toggleInterested = (social: SocialModel) => {
    const socialRef = firebase.firestore().collection("socials").doc(social.id);
    const currentUser = firebase.auth().currentUser?.email;

    if (currentUser && !social.usersLiked.includes(currentUser)) {
      const newArray = social.usersLiked;
      newArray.push(currentUser);
      return socialRef.update({
        usersLiked: newArray
      })
      .then(() => {
          console.log("Document successfully updated!");
          setLikeText("Liked");
          setLikeIcon('heart');
      })
      .catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
      });
    } else if (currentUser) {
      const newArray = social.usersLiked;
      newArray.splice(newArray.indexOf(currentUser), 1);
      return socialRef.update({
        usersLiked: newArray
      })
      .then(() => {
          console.log("Document successfully updated!");
          setLikeText("Like");
          setLikeIcon('heart-outline');
      })
      .catch((error) => {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
      });
    }
  };

  const deleteSocial = (social: SocialModel) => {
    const currentUser = firebase.auth().currentUser?.email;

    if (currentUser && social.owner == currentUser) {
      firebase.firestore().collection("socials").doc(social.id).delete().then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
          console.error("Error removing document: ", error);
      });
    } 
  };

  const renderSocial = ({ item }: { item: SocialModel }) => {
    const onPress = () => {
      navigation.navigate("DetailScreen", {
        social: item,
      });
    };

    let numLikesText = " likes";
    if (item.usersLiked.length == 1) {
      numLikesText = " like";
    }

    const currentUser = firebase.auth().currentUser?.email;
    if (currentUser && item.owner == currentUser) {
      return (
        <Card onPress={onPress} style={{ margin: 16 }}>
          <Card.Cover source={{ uri: item.eventImage }} />
          <Card.Title
            title={item.eventName}
            subtitle={
              item.eventLocation +
              " • " +
              new Date(item.eventDate).toLocaleString() + 
              " • " +
              String(item.usersLiked.length) + numLikesText
            }
          />
          <Card.Actions>
            <Button onPress={() => toggleInterested(item)} icon={likeIcon}>{likeText}</Button>
            <Button onPress={() => deleteSocial(item)} color='red'>Delete</Button>
          </Card.Actions>
        </Card>
      );
    } else {
      return (
        <Card onPress={onPress} style={{ margin: 16 }}>
          <Card.Cover source={{ uri: item.eventImage }} />
          <Card.Title
            title={item.eventName}
            subtitle={
              item.eventLocation +
              " • " +
              new Date(item.eventDate).toLocaleString()
            }
          />
          <Card.Actions>
            <Button onPress={() => toggleInterested(item)} icon={likeIcon}>{likeText}</Button>
          </Card.Actions>
        </Card>
      );
    }
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action
          icon="exit-to-app"
          onPress={() => firebase.auth().signOut()}
        />
        <Appbar.Content title="Socials" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            navigation.navigate("NewSocialScreen");
          }}
        />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={styles.container}>
        <FlatList
          data={socials}
          renderItem={renderSocial}
          keyExtractor={(_: any, index: number) => "key-" + index}
          ListEmptyComponent={
            <Text style={{"textAlign": 'center', paddingTop:20, fontSize:20, paddingHorizontal:20, color:'gray'}}>
              Welcome! To get started, use the plus button in the top right corner to create a new social.
            </Text>
          }
        />
      </View>
    </>
  );
}
