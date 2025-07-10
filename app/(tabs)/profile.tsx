import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from "@/lib/user-store"


export default function Profile() {
  const { onLogout, authState } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user  = useUserStore((state) => state.user)

  // Mock user data - in a real app, this would come from your API or auth context
  const userData = {
    name: `${user?.contact?.firstName} ${user?.contact?.lastName}`,
    email: `${user?.contact?.firstName?.toLocaleLowerCase()}.${user?.contact?.lastName?.toLocaleLowerCase()}@example.com`,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinDate: 'Joined March 2024',
    phone: user?.contact?.phone,
    location: user?.addresses[0]?.city
  };

  const handleLogout = () => {
    // Show confirmation dialog before logging out
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await onLogout?.();
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  // Reusable component for profile menu items
  const ProfileMenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    variant = 'default' 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    variant?: 'default' | 'destructive';
  }) => (
    <TouchableOpacity 
      className={`
        flex-row items-center p-4 bg-white rounded-lg border border-gray-200 mb-3
        ${onPress ? 'active:bg-gray-50' : ''}
      `}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className={`
        w-10 h-10 rounded-full items-center justify-center mr-3
        ${variant === 'destructive' ? 'bg-red-100' : 'bg-gray-100'}
      `}>
        <MaterialIcons 
          name={icon as any} 
          size={20} 
          color={variant === 'destructive' ? '#ef4444' : '#6b7280'} 
        />
      </View>
      
      <View className="flex-1">
        <Text className={`
          font-medium text-base
          ${variant === 'destructive' ? 'text-red-600' : 'text-gray-900'}
        `}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      
      {showChevron && onPress && (
        <MaterialIcons 
          name="chevron-right" 
          size={20} 
          color="#9ca3af" 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section with User Info */}
      <View className="bg-white px-6 pt-8 pb-6 border-b border-gray-200">
        <View className="items-center">
          {/* Avatar */}
          <View className="relative mb-4">
            <Image 
              source={{ uri: userData.avatar }}
              className="w-24 h-24 rounded-full"
            />
            {/* Online status indicator */}
            <View className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
          </View>
          
          {/* User Details */}
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {userData.name}
          </Text>
          <Text className="text-gray-600 mb-2">
            {userData.email}
          </Text>
          <Text className="text-sm text-gray-500">
            {userData.joinDate}
          </Text>
        </View>
      </View>

      {/* Profile Information Section */}
      <View className="px-6 py-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Profile Information
        </Text>
        
        <ProfileMenuItem
          icon="email"
          title="Email Address"
          subtitle={userData.email}
          showChevron={false}
        />
        
        <ProfileMenuItem
          icon="phone"
          title="Phone Number"
          subtitle={userData.phone}
          onPress={() => Alert.alert('Feature', 'Edit phone number coming soon!')}
        />
        
        <ProfileMenuItem
          icon="location-on"
          title="Location"
          subtitle={userData.location}
          onPress={() => Alert.alert('Feature', 'Edit location coming soon!')}
        />
      </View>

      {/* Settings Section */}
      <View className="px-6 py-2">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Settings
        </Text>
        
        <ProfileMenuItem
          icon="edit"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => Alert.alert('Feature', 'Edit profile coming soon!')}
        />
        
        <ProfileMenuItem
          icon="notifications"
          title="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => Alert.alert('Feature', 'Notification settings coming soon!')}
        />
        
        <ProfileMenuItem
          icon="security"
          title="Privacy & Security"
          subtitle="Password and security settings"
          onPress={() => Alert.alert('Feature', 'Security settings coming soon!')}
        />
        
        <ProfileMenuItem
          icon="help"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => Alert.alert('Feature', 'Help center coming soon!')}
        />
      </View>

      {/* Logout Section */}
      <View className="px-6 py-6">
        <ProfileMenuItem
          icon="logout"
          title={isLoggingOut ? "Signing out..." : "Sign Out"}
          variant="destructive"
          onPress={!isLoggingOut ? handleLogout : undefined}
          showChevron={false}
        />
      </View>

      {/* App Version Footer */}
      <View className="px-6 pb-8 pt-4">
        <Text className="text-center text-sm text-gray-400">
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}