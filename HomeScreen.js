import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { SearchBar } from 'react-native-elements';

const UserCard = ({ user, navigation }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileInitial}>
            {user.field ? user.field.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.role || 'User'}</Text>
          <Text style={styles.userField}>{user.field || 'Unknown field'}</Text>
          <Text style={styles.userLocation}>
            {user.country || 'Unknown location'} • {user.experience || '0'} years experience
          </Text>
        </View>
      </View>

      <Text style={styles.userBio} numberOfLines={3}>
        {user.bio || 'No bio available'}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile', { userId: user.id })}
        >
          <Text style={styles.actionButtonText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('Chat', { userId: user.id })}
        >
          <Text style={styles.primaryButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine the user type to filter by
  const userTypeToFind = userProfile?.userType === 'employee' ? 'employer' : 'employee';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userType', '==', userTypeToFind));
      const querySnapshot = await getDocs(q);

      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userTypeToFind]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.role?.toLowerCase().includes(query) ||
      user.field?.toLowerCase().includes(query) ||
      user.country?.toLowerCase().includes(query) ||
      user.bio?.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {userProfile?.role || 'User'}
        </Text>
        <Text style={styles.subheaderText}>
          {userProfile?.userType === 'employee'
            ? 'Find potential employers'
            : 'Find potential employees'}
        </Text>
      </View>

      <SearchBar
        placeholder="Search by role, field, or country..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainer}
        lightTheme
        round
      />

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loaderText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserCard user={item} navigation={navigation} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4285F4']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No users match your search criteria'
                  : `No ${userTypeToFind}s found`}
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subheaderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  searchBarInputContainer: {
    backgroundColor: '#E8E8E8',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  userField: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userLocation: {
    fontSize: 12,
    color: '#888',
  },
  userBio: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  primaryButton: {
    backgroundColor: '#4285F4',
    marginRight: 0,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default HomeScreen;
