import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to register a new user
  const signup = async (email, password, profileData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Save user profile info to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Function to log in a user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Function to log out a user
  const logout = () => {
    return signOut(auth);
  };

  // Function to fetch user profile data
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        // Cache user profile
        await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    try {
      if (!currentUser) throw new Error("No authenticated user");

      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, {
        ...userProfile,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Refresh user profile
      return await fetchUserProfile(currentUser.uid);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const loadCachedProfile = async () => {
      try {
        const cachedProfile = await AsyncStorage.getItem('userProfile');
        if (cachedProfile) {
          setUserProfile(JSON.parse(cachedProfile));
        }
      } catch (error) {
        console.error("Error loading cached profile:", error);
      }
    };

    loadCachedProfile();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        await AsyncStorage.removeItem('userProfile');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
