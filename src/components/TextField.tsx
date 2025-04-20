import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../constants/theme';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  required?: boolean;
  helperText?: string;
  autoComplete?: string;
  testID?: string;
}

const TextField = forwardRef<TextInput, TextFieldProps>((props, ref) => {
  const {
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    onFocus,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    maxLength,
    multiline = false,
    numberOfLines = 1,
    editable = true,
    rightIcon,
    leftIcon,
    containerStyle,
    inputStyle,
    labelStyle,
    required = false,
    helperText,
    autoComplete,
    testID,
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(!secureTextEntry);
  const animatedIsFocused = useRef(
    new Animated.Value(value ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value !== '' ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedIsFocused]);

  const handleFocus = (
    e: NativeSyntheticEvent<TextInputFocusEventData>
  ) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (
    e: NativeSyntheticEvent<TextInputFocusEventData>
  ) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((v) => !v);
  };

  const labelAnimatedStyle = {
    position: 'absolute' as const,
    left: leftIcon ? 40 : 15,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [15, -8],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [
        colors.secondary.main,
        colors.primary.main,
      ],
    }),
    backgroundColor: colors.background.paper,
    paddingHorizontal: 5,
    zIndex: 10,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Animated.Text
          style={[labelAnimatedStyle, labelStyle]}
        >
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Animated.Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          !editable && styles.disabledInput,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={
            secureTextEntry && !isPasswordVisible
          }
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          placeholder={
            isFocused || !label ? placeholder : ''
          }
          placeholderTextColor={colors.secondary.main}
          style={[
            styles.input,
            multiline ? styles.multilineInput : null,
            leftIcon
              ? ({ paddingLeft: 0 } as TextStyle)
              : null,
            rightIcon
              ? ({ paddingRight: 0 } as TextStyle)
              : null,
            inputStyle,
          ]}
          testID={testID}
          autoComplete={autoComplete as any}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Text style={styles.visibilityToggle}>
              {isPasswordVisible ? 'Cacher' : 'Afficher'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>

      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            error && styles.errorText,
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary.light,
    borderRadius: 8,
    backgroundColor: colors.background.paper,
    minHeight: 50,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 5,
    minHeight: 50,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
    paddingTop: 12,
  },
  leftIconContainer: {
    paddingRight: 10,
  },
  rightIconContainer: {
    paddingLeft: 10,
  },
  focusedInput: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  errorInput: {
    borderColor: colors.danger.main,
  },
  disabledInput: {
    backgroundColor: colors.secondary.light,
    borderColor: colors.secondary.light,
  },
  required: {
    color: colors.danger.main,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
    color: colors.secondary.main,
  },
  errorText: {
    color: colors.danger.main,
  },
  visibilityToggle: {
    color: colors.primary.main,
    fontSize: 14,
  },
});

export default TextField;
