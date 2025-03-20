import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = ({ route, navigation }) => {
  const { userId } = route?.params || {};
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Editable profile fields
  const [editableProfile, setEditableProfile] = useState({
    role: '',
    field: '',
    experience: '',
    country: '',
    citizenship: '',
    bio: '',
  });

  const isOwnProfile = !userId || userId === currentUser?.uid;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // If viewing own profile, use stored profile
        if (isOwnProfile) {
          setProfile(userProfile);
          setEditableProfile({
            role: userProfile?.role || '',
            field: userProfile?.field || '',
            experience: userProfile?.experience || '',
            country: userProfile?.country || '',
            citizenship: userProfile?.citizenship || '',
            bio: userProfile?.bio || '',
          });
          setLoading(false);
          return;
        }

        // Else fetch the other user's profile
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile(userData);
        } else {
          Alert.alert('Error', 'User profile not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, userProfile, isOwnProfile, currentUser?.uid]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset editable profile to current values
    setEditableProfile({
      role: profile?.role || '',
      field: profile?.field || '',
      experience: profile?.experience || '',
      country: profile?.country || '',
      citizenship: profile?.citizenship || '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);

      // Update profile in Firebase
      await updateUserProfile(editableProfile);

      // Update local state
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageLarge}>
            <Text style={styles.profileInitialLarge}>
              {profile?.field ? profile.field.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>

          {!isEditing ? (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.role || 'User'}</Text>
              <Text style={styles.profileDetail}>
                {profile?.field || 'No field specified'} • {profile?.experience || '0'} years
              </Text>
              <Text style={styles.profileLocation}>
                {profile?.country || 'Unknown location'} • {profile?.userType === 'employer' ? 'Employer' : 'Employee'}
              </Text>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.editingTitle}>Editing Profile</Text>
            </View>
          )}

          {isOwnProfile && !isEditing && (
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <MaterialIcons name="edit" size={24} color="#4285F4" />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <Text style={styles.label}>Role or Position</Text>
            <TextInput
              style={styles.input}
              value={editableProfile.role}
              onChangeText={(text) => setEditableProfile({...editableProfile, role: text})}
              placeholder="e.g. Software Engineer, Marketing Manager"
            />

            <Text style={styles.label}>Field of Experience</Text>
            <TextInput
              style={styles.input}
              value={editableProfile.field}
              onChangeText={(text) => setEditableProfile({...editableProfile, field: text})}
              placeholder="e.g. Software Development, Marketing"
            />

            <Text style={styles.label}>Years of Experience</Text>
            <TextInput
              style={styles.input}
              value={editableProfile.experience}
              onChangeText={(text) => setEditableProfile({...editableProfile, experience: text})}
              placeholder="e.g. 3, 5+"
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Country of Residence</Text>
            <TextInput
              style={styles.input}
              value={editableProfile.country}
              onChangeText={(text) => setEditableProfile({...editableProfile, country: text})}
              placeholder="Enter your country"
            />

            <Text style={styles.label}>Citizenship</Text>
            <TextInput
              style={styles.input}
              value={editableProfile.citizenship}
              onChangeText={(text) => setEditableProfile({...editableProfile, citizenship: text})}
              placeholder="Enter your citizenship"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={editableProfile.bio}
              onChangeText={(text) => setEditableProfile({...editableProfile, bio: text})}
              placeholder="Write a short bio about yourself"
              multiline
              textAlignVertical="top"
            />

            <View style={styles.editButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={savingProfile}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.bioText}>
                {profile?.bio || 'No bio available'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role:</Text>
                <Text style={styles.detailValue}>{profile?.role || 'Not specified'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Field:</Text>
                <Text style={styles.detailValue}>{profile?.field || 'Not specified'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Experience:</Text>
                <Text style={styles.detailValue}>{profile?.experience || '0'} years</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Country:</Text>
                <Text style={styles.detailValue}>{profile?.country || 'Not specified'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Citizenship:</Text>
                <Text style={styles.detailValue}>{profile?.citizenship || 'Not specified'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gender:</Text>
                <Text style={styles.detailValue}>
                  {profile?.gender
                    ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
                    : 'Not specified'}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certificates</Text>
              <View style={styles.certificatesContainer}>
                <Text style={styles.emptyStateText}>
                  No certificates available yet. Complete Bridge-Learning courses to earn certificates.
                </Text>
              </View>
            </View>

            {!isOwnProfile && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => navigation.navigate('Chat', { userId: userId })}
              >
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  profileImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitialLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileLocation: {
    fontSize: 14,
    color: '#666',
  },
  editingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4285F4',
  },
  editButton: {
    padding: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  bioText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  certificatesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editForm: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;
