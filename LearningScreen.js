import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Sample courses data
const coursesData = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Learn the core concepts of JavaScript programming',
    level: 'Beginner',
    duration: '4 weeks',
    image: require('../assets/images/javascript.png'),
    topics: ['Variables & Data Types', 'Functions', 'DOM Manipulation', 'ES6+ Features'],
  },
  {
    id: '2',
    title: 'React Native Development',
    description: 'Build cross-platform mobile apps with React Native',
    level: 'Intermediate',
    duration: '6 weeks',
    image: require('../assets/images/react.png'),
    topics: ['Component Design', 'Navigation', 'State Management', 'API Integration'],
  },
  {
    id: '3',
    title: 'Advanced Node.js',
    description: 'Master server-side JavaScript with Node.js',
    level: 'Advanced',
    duration: '8 weeks',
    image: require('../assets/images/nodejs.png'),
    topics: ['Express Framework', 'RESTful APIs', 'Authentication', 'Database Integration'],
  },
  {
    id: '4',
    title: 'UI/UX Design Principles',
    description: 'Learn to create engaging and user-friendly interfaces',
    level: 'Beginner',
    duration: '5 weeks',
    image: require('../assets/images/ui-ux.png'),
    topics: ['Design Thinking', 'Wireframing', 'Prototyping', 'User Testing'],
  },
];

const CourseCard = ({ course, onPress }) => {
  return (
    <TouchableOpacity style={styles.courseCard} onPress={() => onPress(course)}>
      <View style={styles.courseCardContent}>
        <View style={styles.courseImageContainer}>
          <Image
            source={course.image}
            style={styles.courseImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
          <View style={styles.courseDetails}>
            <View style={styles.courseDetailItem}>
              <MaterialIcons name="school" size={14} color="#666" />
              <Text style={styles.courseDetailText}>{course.level}</Text>
            </View>
            <View style={styles.courseDetailItem}>
              <MaterialIcons name="access-time" size={14} color="#666" />
              <Text style={styles.courseDetailText}>{course.duration}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.courseCardFooter}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
        <MaterialIcons name="arrow-forward" size={16} color="#4285F4" />
      </View>
    </TouchableOpacity>
  );
};

const LearningScreen = () => {
  const [featuredCourses, setFeaturedCourses] = useState(coursesData.slice(0, 2));
  const [allCourses, setAllCourses] = useState(coursesData);

  const handleCoursePress = (course) => {
    Alert.alert(
      'Course Currently Unavailable',
      'This course is coming soon. You will be notified when it becomes available.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderFeaturedCourse = ({ item }) => (
    <CourseCard course={item} onPress={handleCoursePress} />
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bridge Learning</Text>
        <Text style={styles.headerSubtitle}>
          Enhance your skills with our curated developer courses
        </Text>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Courses</Text>
        <FlatList
          data={featuredCourses}
          renderItem={renderFeaturedCourse}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredCoursesContainer}
        />
      </View>

      <View style={styles.allCoursesSection}>
        <Text style={styles.sectionTitle}>All Courses</Text>
        {allCourses.map((course) => (
          <CourseCard key={course.id} course={course} onPress={handleCoursePress} />
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Benefits of Bridge Learning</Text>
        <View style={styles.benefitItem}>
          <MaterialIcons name="verified" size={24} color="#4285F4" />
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Industry-Recognized Certificates</Text>
            <Text style={styles.benefitDescription}>
              Earn certificates that can be displayed on your profile
            </Text>
          </View>
        </View>
        <View style={styles.benefitItem}>
          <MaterialIcons name="person" size={24} color="#4285F4" />
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Expert Mentors</Text>
            <Text style={styles.benefitDescription}>
              Learn from experienced professionals in the field
            </Text>
          </View>
        </View>
        <View style={styles.benefitItem}>
          <MaterialIcons name="devices" size={24} color="#4285F4" />
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Practical Projects</Text>
            <Text style={styles.benefitDescription}>
              Build a portfolio with real-world projects
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#4285F4',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuredSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  featuredCoursesContainer: {
    paddingRight: 20,
  },
  allCoursesSection: {
    padding: 20,
    paddingTop: 0,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseCardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  courseImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  courseImage: {
    width: 60,
    height: 60,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  courseDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  courseDetails: {
    flexDirection: 'row',
  },
  courseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  courseDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  courseCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  signUpButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4285F4',
    marginRight: 5,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  benefitTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 12,
    color: '#666',
  },
});

export default LearningScreen;
