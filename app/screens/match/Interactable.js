import React from "react";
import { View, ViewStyle } from "react-native";

import {
  GestureHandler,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { snapPoint } from "react-native-redash";
const { runSpring, binaryInterpolation } = Animated;

const {
  Value, event, block, set, cond, eq, Clock, call, clockRunning,
} = Animated;

export default ({
  style, x, y, snapPoints, onSnap,
}: InteractableProps) => {
  const clock = new Clock();
  const spring = new Value(0);
  const translationX = new Value(0);
  const translationY = new Value(0);
  const velocityX = new Value(0);
  const snapPointX = new Value(0);
  const state = new Value(State.UNDETERMINED);
  const onGestureEvent = event(
    [
      {
        nativeEvent: {
          velocityX,
          translationX,
          translationY,
          state,
        },
      },
    ],
  );
  const points = snapPoints.map(point => point.x);
  return (
    <PanGestureHandler onHandlerStateChange={onGestureEvent} {...{ onGestureEvent }}>
      <Animated.View {...{ style }}>
        <Animated.Code>
          {
            () => block([
              cond(eq(state, State.END), [
                set(snapPointX, snapPoint(translationX, velocityX, points)),
                set(spring, runSpring(clock, 0, 1)),
                cond(
                  eq(clockRunning(clock), 0),
                  call([snapPointX], ([x]) => onSnap({ nativeEvent: { x } })),
                ),
              ]),
              set(
                x,
                cond(
                  eq(state, State.ACTIVE),
                  translationX,
                  binaryInterpolation(spring, translationX, snapPointX),
                ),
              ),
              set(
                y,
                cond(
                  eq(state, State.ACTIVE),
                  translationY,
                  binaryInterpolation(spring, translationY, 0),
                ),
              ),
            ])
          }
        </Animated.Code>
      </Animated.View>
    </PanGestureHandler>
  );
};
