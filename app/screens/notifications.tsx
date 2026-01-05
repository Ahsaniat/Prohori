import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useKnockFeed, FilterStatus } from '@knocklabs/expo';
import { FeedItem, isRequestInFlight } from '@knocklabs/client';

const stripHtml = (html: string): string => {
  return html
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
};

const parseNotificationContent = (html: string): { title: string; body: string } => {
  const lines = stripHtml(html).split('\n').filter(line => line.trim());
  if (lines.length >= 2) {
    return { title: lines[0], body: lines.slice(1).join('\n') };
  } else if (lines.length === 1) {
    return { title: lines[0], body: '' };
  }
  return { title: '', body: '' };
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const { feedClient, useFeedStore } = useKnockFeed();
  const { items, metadata, networkStatus } = useFeedStore();

  const isLoading = useMemo(() => isRequestInFlight(networkStatus), [networkStatus]);

  useEffect(() => {
    feedClient.fetch({ status: FilterStatus.All, archived: 'exclude' });
  }, [feedClient]);

  useEffect(() => {
    if (metadata.unseen_count > 0) {
      feedClient.markAllAsSeen();
    }
  }, [metadata.unseen_count, feedClient]);

  const onRefresh = useCallback(() => {
    feedClient.fetch({ status: FilterStatus.All, archived: 'exclude' });
  }, [feedClient]);

  const handleNotificationPress = useCallback((item: FeedItem) => {
    if (!item.read_at) {
      feedClient.markAsRead(item);
    }
  }, [feedClient]);

  const handleDeleteNotification = useCallback((item: FeedItem) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            feedClient.markAsArchived(item);
          }
        }
      ]
    );
  }, [feedClient]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationContent = (item: FeedItem) => {
    for (const block of item.blocks) {
      if (block.type === 'markdown' || block.type === 'text') {
        const parsed = parseNotificationContent(block.rendered || '');
        if (parsed.title) {
          return parsed;
        }
      }
    }

    if (item.data) {
      const title = stripHtml((item.data as any).title || '');
      const body = stripHtml((item.data as any).body || (item.data as any).message || '');
      if (title) {
        return { title, body };
      }
    }

    if (item.source) {
      return { title: item.source.key || 'Notification', body: '' };
    }

    return { title: 'Notification', body: '' };
  };

  const renderNotificationItem = (item: FeedItem) => {
    const { title, body } = getNotificationContent(item);
    const isUnread = !item.read_at;

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleDeleteNotification(item)}
        className={`mx-4 mb-3 p-4 rounded-2xl ${
          isUnread 
            ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' 
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        <View className="flex-row items-start">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            isUnread ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            <MaterialIcons 
              name="notifications" 
              size={20} 
              color={isUnread ? '#fff' : colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text 
                className={`font-semibold flex-1 mr-2 ${
                  isUnread 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                numberOfLines={1}
              >
                {title}
              </Text>
              {isUnread && (
                <View className="w-2 h-2 rounded-full bg-purple-600" />
              )}
            </View>
            {body ? (
              <Text 
                className="text-gray-600 dark:text-gray-400 text-sm mb-2"
                numberOfLines={3}
              >
                {body}
              </Text>
            ) : null}
            <Text className="text-gray-400 dark:text-gray-500 text-xs">
              {formatTimeAgo(item.inserted_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <MaterialIcons name="notifications-none" size={40} color="#9CA3AF" />
      </View>
      <Text className="text-gray-900 dark:text-white font-semibold text-lg mb-2">
        No notifications yet
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center px-8">
        When you receive notifications, they'll appear here
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Notifications</Text>
        </View>
        {metadata.unread_count > 0 && (
          <TouchableOpacity 
            onPress={() => feedClient.markAllAsRead()}
            className="py-1 px-3 rounded-full bg-purple-100 dark:bg-purple-900/30"
          >
            <Text className="text-purple-600 dark:text-purple-400 text-sm font-medium">
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification Stats */}
      {(metadata.unread_count > 0 || metadata.unseen_count > 0) && (
        <View className="mx-4 mb-4 flex-row">
          {metadata.unread_count > 0 && (
            <View className="bg-purple-600 px-3 py-1 rounded-full mr-2">
              <Text className="text-white text-xs font-medium">
                {metadata.unread_count} unread
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Loading State */}
      {isLoading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading notifications...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottom + 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        >
          {items.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {items.map(renderNotificationItem)}
              <Text className="text-center text-gray-400 dark:text-gray-600 text-xs mt-4 px-4">
                Long press to delete a notification
              </Text>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
