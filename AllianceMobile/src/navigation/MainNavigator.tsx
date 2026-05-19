import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FeedScreen }      from '../screens/FeedScreen';
import { JobsScreen }      from '../screens/JobsScreen';
import { ReelsScreen }     from '../screens/ReelsScreen';
import { NetworkScreen }   from '../screens/NetworkScreen';
import { ChatScreen }      from '../screens/ChatScreen';
import { NewsScreen }      from '../screens/NewsScreen';
import { CompaniesScreen } from '../screens/CompaniesScreen';
import { ProfileScreen }   from '../screens/ProfileScreen';
import { HelpScreen }      from '../screens/HelpScreen';
import { Colors }          from '../theme/colors';

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const ALL_TABS: { name: string; label: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'Feed',      label: 'Inicio',    icon: 'home-outline',              iconActive: 'home'                },
  { name: 'Jobs',      label: 'Empleos',   icon: 'briefcase-outline',         iconActive: 'briefcase'           },
  { name: 'Reels',     label: 'Reels',     icon: 'play-circle-outline',       iconActive: 'play-circle'         },
  { name: 'Network',   label: 'Mi Red',    icon: 'account-group-outline',     iconActive: 'account-group'       },
  { name: 'Chat',      label: 'Chat',      icon: 'message-outline',           iconActive: 'message'             },
  { name: 'News',      label: 'Noticias',  icon: 'newspaper-variant-outline', iconActive: 'newspaper-variant'   },
  { name: 'Companies', label: 'Empresas',  icon: 'office-building-outline',   iconActive: 'office-building'     },
  { name: 'Profile',   label: 'Perfil',    icon: 'account-circle-outline',    iconActive: 'account-circle'      },
  { name: 'Help',      label: 'Ayuda',     icon: 'help-circle-outline',       iconActive: 'help-circle'         },
];

const ITEM_WIDTH = 68;

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.barWrapper} pointerEvents="box-none">
      <View style={styles.bar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={ITEM_WIDTH}
          bounces={false}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const item = ALL_TABS.find((t) => t.name === route.name);
            if (!item) return null;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                }}
                activeOpacity={0.7}
                style={[styles.tabItem, isFocused && styles.tabItemActive]}
              >
                <MaterialCommunityIcons
                  name={isFocused ? item.iconActive : item.icon}
                  size={24}
                  color={isFocused ? Colors.primary : '#999'}
                />
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]} numberOfLines={1}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Feed"      component={FeedScreen} />
      <Tab.Screen name="Jobs"      component={JobsScreen} />
      <Tab.Screen name="Reels"     component={ReelsScreen} />
      <Tab.Screen name="Network"   component={NetworkScreen} />
      <Tab.Screen name="Chat"      component={ChatScreen} />
      <Tab.Screen name="News"      component={NewsScreen} />
      <Tab.Screen name="Companies" component={CompaniesScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
      <Tab.Screen name="Help"      component={HelpScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 26 : 16,
    paddingHorizontal: 16,
  },
  bar: {
    backgroundColor: '#FFDEDE',
    borderRadius: 35,
    height: 66,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#FAD0D0',
    overflow: 'hidden',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  tabItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 24,
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: 'rgba(233,30,140,0.12)',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
