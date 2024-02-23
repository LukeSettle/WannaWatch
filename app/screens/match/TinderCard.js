import React from 'react'
import { Text, View, Pressable, PanResponder, Dimensions, StyleSheet, Platform } from 'react-native'
import { useSpring, animated } from '@react-spring/native'
import colors from "../../../config/colors";
const { height, width } = Dimensions.get('window')

const settings = {
  maxTilt: 25, // in deg
  rotationPower: 50,
  swipeThreshold: 0.5 // need to update this threshold for RN (1.5 seems reasonable...?)
}

// physical properties of the spring
const physics = {
  touchResponsive: {
    friction: 50,
    tension: 2000
  },
  animateOut: {
    friction: 30,
    tension: 400
  },
  animateBack: {
    friction: 10,
    tension: 200
  }
}

const pythagoras = (x, y) => {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}

const normalize = (vector) => {
  const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
  return { x: vector.x / length, y: vector.y / length }
}

const animateOut = async (gesture, setSpringTarget) => {
  const diagonal = pythagoras(height, width)
  const velocity = pythagoras(gesture.x, gesture.y)
  const finalX = diagonal * gesture.x
  const finalY = diagonal * gesture.y
  const finalRotation = gesture.x * 45
  const duration = diagonal / velocity

  setSpringTarget.current[0].start({
    x: finalX,
    y: finalY,
    rot: finalRotation, // set final rotation value based on gesture.vx
    config: { duration: duration }
  })

  // for now animate back
  return await new Promise((resolve) =>
    setTimeout(() => {
      resolve()
    }, duration)
  )
}

const animateBack = (setSpringTarget) => {
  // translate back to the initial position
  return new Promise((resolve) => {
    setSpringTarget.current[0].start({ x: 0, y: 0, rot: 0, config: physics.animateBack, onRest: resolve })
  })
}

const getSwipeDirection = (property) => {
  if (Math.abs(property.x) > Math.abs(property.y)) {
    if (property.x > settings.swipeThreshold) {
      return 'right'
    } else if (property.x < -settings.swipeThreshold) {
      return 'left'
    }
  } else {
    if (property.y > settings.swipeThreshold) {
      return 'down'
    } else if (property.y < -settings.swipeThreshold) {
      return 'up'
    }
  }
  return 'none'
}

// must be created outside of the TinderCard forwardRef
const AnimatedView = animated(View)

const TinderCard = React.forwardRef(
  (
    { flickOnSwipe = true, children, onSwipe, onCardLeftScreen, className, preventSwipe = [], swipeRequirementType = 'velocity', swipeThreshold = settings.swipeThreshold, onSwipeRequirementFulfilled, onSwipeRequirementUnfulfilled },
    ref
  ) => {
    const [{ x, y, rot }, setSpringTarget] = useSpring(() => ({
      x: 0,
      y: 0,
      rot: 0,
      config: physics.touchResponsive
    }))
    settings.swipeThreshold = swipeThreshold

    React.useImperativeHandle(ref, () => ({
      async swipe (dir = 'right') {
        if (onSwipe) onSwipe(dir)
        const power = 1.3
        const disturbance = (Math.random() - 0.5) / 2
        if (dir === 'right') {
          await animateOut({ x: power, y: disturbance }, setSpringTarget)
        } else if (dir === 'left') {
          await animateOut({ x: -power, y: disturbance }, setSpringTarget)
        } else if (dir === 'up') {
          await animateOut({ x: disturbance, y: power }, setSpringTarget)
        } else if (dir === 'down') {
          await animateOut({ x: disturbance, y: -power }, setSpringTarget)
        }
        if (onCardLeftScreen) onCardLeftScreen(dir)
      },
      async restoreCard () {
        await animateBack(setSpringTarget)
      }
    }))

    const handleSwipeReleased = React.useCallback(
      async (setSpringTarget, gesture) => {
        // Check if this is a swipe
        const dir = getSwipeDirection({
          x: swipeRequirementType === 'velocity' ? gesture.vx : gesture.dx,
          y: swipeRequirementType === 'velocity' ? gesture.vy : gesture.dy
        })

        if (dir !== 'none') {
          if (flickOnSwipe) {
            if (!preventSwipe.includes(dir)) {
              if (onSwipe) onSwipe(dir)

              await animateOut(swipeRequirementType === 'velocity' ? ({
                x: gesture.vx,
                y: gesture.vy
              }) : (
                normalize({ x: gesture.dx, y: gesture.dy }) // Normalize to avoid flicking the card away with super fast speed only direction is wanted here
              ), setSpringTarget, swipeRequirementType)
              if (onCardLeftScreen) onCardLeftScreen(dir)
              return
            }
          }
        }

        // Card was not flicked away, animate back to start
        animateBack(setSpringTarget)
      },
      [flickOnSwipe, onSwipe, onCardLeftScreen, preventSwipe]
    )

    let swipeThresholdFulfilledDirection = 'none'
    const panResponder = React.useMemo(
      () =>
        PanResponder.create({
          // Ask to be the responder:
          onStartShouldSetPanResponder: (evt, gestureState) => {
            // Determine condition to allow press events
            // For example, check gestureState.dx and gestureState.dy
            console.log("should start?", (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10))
            if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
              return false; // Do not become responder, allowing the Pressable to capture the press event.
            }
            return true;
          },
          onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
          onMoveShouldSetPanResponder: (evt, gestureState) => true,
          onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

          onPanResponderGrant: (evt, gestureState) => {
            // The gesture has started.
            // Probably wont need this anymore as postion i relative to swipe!
            setSpringTarget.current[0].start({ x: gestureState.dx, y: gestureState.dy, rot: 0, config: physics.touchResponsive })
          },
          onPanResponderMove: (evt, gestureState) => {
            // Check fulfillment
            if (onSwipeRequirementFulfilled || onSwipeRequirementUnfulfilled) {
              const dir = getSwipeDirection({
                x: swipeRequirementType === 'velocity' ? gestureState.vx : gestureState.dx,
                y: swipeRequirementType === 'velocity' ? gestureState.vy : gestureState.dy
              })
              if (dir !== swipeThresholdFulfilledDirection) {
                swipeThresholdFulfilledDirection = dir
                if (swipeThresholdFulfilledDirection === 'none') {
                  if (onSwipeRequirementUnfulfilled) onSwipeRequirementUnfulfilled()
                } else {
                  if (onSwipeRequirementFulfilled) onSwipeRequirementFulfilled(dir)
                }
              }
            }

            // use guestureState.vx / guestureState.vy for velocity calculations
            // translate element
            let rot = ((300 * gestureState.vx) / width) * 15// Magic number 300 different on different devices? Run on physical device!
            rot = Math.max(Math.min(rot, settings.maxTilt), -settings.maxTilt)
            setSpringTarget.current[0].start({ x: gestureState.dx, y: gestureState.dy, rot, config: physics.touchResponsive })
          },
          onPanResponderTerminationRequest: (evt, gestureState) => {
            return true
          },
          onPanResponderRelease: (evt, gestureState) => {
            // The user has released all touches while this view is the
            // responder. This typically means a gesture has succeeded
            // enable
            handleSwipeReleased(setSpringTarget, gestureState)
          }
        }),
      []
    )

    return (
      <Pressable onPress={() => console.log("Card Clicked")}>
        <AnimatedView
          {...panResponder.panHandlers}
          style={{
            transform: [
              { translateX: x },
              { translateY: y },
              { rotate: rot.to((rot) => `${rot}deg`) }
            ]
          }}
          className={className}
        >
          {children}
          <View style={styles.buttonsWrapper}>
            <AnimatedView
              style={[
                styles.buttonContainer,
                styles.likeButton,
                { opacity: x.to((x) => (x < 0 ? 0 : x / swipeThreshold)) },
              ]}
            >
              <Text style={styles.likeText}>Like</Text>
            </AnimatedView>
            <AnimatedView
              style={[
                styles.buttonContainer,
                styles.nopeButton,
                { opacity: x.to((x) => (x > 0 ? 0 : -x / swipeThreshold)) },
              ]}
            >
              <Text style={styles.nopeText}>Nope</Text>
            </AnimatedView>
          </View>
        </AnimatedView>
      </Pressable>
    )
  }
)

const styles = StyleSheet.create({
  buttonsWrapper: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  buttonContainer: {
    height: undefined,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  likeButton: {
    backgroundColor: colors.quaternary,
    color: "white",
  },
  nopeButton: {
    backgroundColor: colors.red,
    color: "white",
  },
  likeText: {
    color: "white",
    fontSize: 30,
    fontFamily: Platform.OS === "ios" ? "Baskerville-SemiBoldItalic" : "serif",
  },
  nopeText: {
    color: "white",
    fontSize: 30,
    fontFamily: Platform.OS === "ios" ? "Baskerville-SemiBoldItalic" : "serif",
  },
})

export default TinderCard