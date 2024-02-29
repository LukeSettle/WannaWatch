import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ROTATION_ANGLE = 10; // Adjust this for more or less rotation

const TinderCard = ({ children, onSwipe }) => {
  const translateX = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);
  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);

  const handleSwipeComplete = (swipeDirection) => {
    onSwipe(swipeDirection);
    likeOpacity.value = 0; // Reset likeOpacity
    nopeOpacity.value = 0; // Reset nopeOpacity
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      likeOpacity.value = translateX.value > 0 ? Math.min(1, translateX.value / (SCREEN_WIDTH * 0.5)) : 0;
      nopeOpacity.value = translateX.value < 0 ? Math.min(1, -translateX.value / (SCREEN_WIDTH * 0.5)) : 0;
    },
    onEnd: (_) => {
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const swipeDirection = translateX.value > 0 ? 'right' : 'left';
        runOnJS(handleSwipeComplete)(swipeDirection);
      } else {
        translateX.value = withSpring(0);
        likeOpacity.value = withSpring(0);
        nopeOpacity.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = translateX.value / SCREEN_WIDTH * ROTATION_ANGLE;
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: nopeOpacity.value,
  }));

  const onPress = () => {
    setFlipped(!flipped);
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Like and Nope indicators */}
          <Animated.Text style={[styles.like, likeStyle]}>LIKE</Animated.Text>
          <Animated.Text style={[styles.nope, nopeStyle]}>NOPE</Animated.Text>

          {/* Card content */}
          <View style={styles.content} onTouchEnd={onPress}>
            {flipped ? (
              children[1]
            ) : (
              children[0]
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 300,
    height: 400,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative', // Ensure indicators are positioned absolutely within the card
    zIndex: 1,
  },
  like: {
    position: 'absolute',
    top: 20,
    left: 20,
    fontSize: 32,
    color: 'green',
    fontWeight: 'bold',
    transform: [{ rotate: '-20deg' }],
    zIndex: 2,
    backgroundColor: 'white', // Added white background
    borderWidth: 2, // Added border width
    borderColor: 'green', // Matching border color with text
    padding: 8, // Added padding for better text visibility
    borderRadius: 5, // Rounded corners for the border
    overflow: 'hidden', // Ensures the background does not bleed outside the border radius
    elevation: 4, // Add shadow effect for Android
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow direction and distance
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow blur radius
  },
  nope: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 32,
    color: 'red',
    fontWeight: 'bold',
    transform: [{ rotate: '20deg' }],
    zIndex: 2,
    backgroundColor: 'white', // Added white background
    borderWidth: 2, // Added border width
    borderColor: 'red', // Matching border color with text
    padding: 8, // Added padding for better text visibility
    borderRadius: 5, // Rounded corners for the border
    overflow: 'hidden', // Ensures the background does not bleed outside the border radius
    elevation: 4, // Add shadow effect for Android
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow direction and distance
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow blur radius
  },
  content: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TinderCard;
