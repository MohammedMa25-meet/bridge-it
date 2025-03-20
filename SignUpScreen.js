import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';

const SignUpScreen = ({ navigation }) => {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic account info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Questionnaire
  const [userType, setUserType] = useState('employee');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [citizenship, setCitizenship] = useState('');
  const [field, setField] = useState('');
  const [experience, setExperience] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!userType || !gender || !country || !citizenship || !field || !experience || !role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep2()) return;

    try {
      setLoading(true);

      // Collect all profile data
      const profileData = {
        userType,
        gender,
        country,
        citizenship,
        field,
        experience,
        role,
        bio,
      };

      await signup(email, password, profileData);
      Alert.alert('Success', 'Account created successfully');
      // Navigation will be handled by AuthContext state change
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Failed', error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            {currentStep === 1
              ? 'Please fill in your account details'
              : 'Tell us more about yourself'}
          </Text>
        </View>

        {currentStep === 1 ? (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleNextStep}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.label}>I am a(n)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userType}
                onValueChange={(itemValue) => setUserType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Employee" value="employee" />
                <Picker.Item label="Employer" value="employer" />
              </Picker>
            </View>

            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>

            <Text style={styles.label}>Country of Residence</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your country"
              value={country}
              onChangeText={setCountry}
            />

            <Text style={styles.label}>Citizenship</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your citizenship"
              value={citizenship}
              onChangeText={setCitizenship}
            />

            <Text style={styles.label}>Field of Experience</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Software Development, Marketing"
              value={field}
              onChangeText={setField}
            />

            <Text style={styles.label}>Years of Experience</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3, 5+"
              value={experience}
              onChangeText={setExperience}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Role or Position</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Software Engineer, Marketing Manager"
              value={role}
              onChangeText={setRole}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Write a short bio about yourself (limited to 200 words)"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              Tips: Include your professional background, key skills, career goals, and what you're looking for.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handlePrevStep}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  bioInput: {
    height: 120,
    paddingTop: 15,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: -15,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4285F4',
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4285F4',
    marginLeft: 5,
  },
});

export default SignUpScreen;
