import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STATS = [
  { label: 'Open\nWork Orders', value: '4', colorKey: 'warning' as const },
  { label: 'Active\nAircraft', value: '6', colorKey: 'primary' as const },
  { label: 'Due This\nMonth', value: '3', colorKey: 'danger' as const },
];

const RECENT_WORK_ORDERS = [
  { id: 'WO-1042', tail: 'N182TW', description: '100-Hour Inspection', status: 'In Progress', statusType: 'warning' as const },
  { id: 'WO-1041', tail: 'N44XA', description: 'Annual Inspection', status: 'Open', statusType: 'danger' as const },
  { id: 'WO-1040', tail: 'N8801B', description: 'Avionics Update – G530', status: 'Complete', statusType: 'success' as const },
];

const UPCOMING_REMINDERS = [
  { tail: 'N182TW', type: 'Pitot-Static Check', due: 'Mar 28, 2026' },
  { tail: 'N44XA', type: 'ELT Battery Replacement', due: 'Apr 5, 2026' },
  { tail: 'N7762C', type: 'Oil Change', due: 'Apr 12, 2026' },
];

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const s = styles(colors);

  const statusStyle = (type: 'warning' | 'danger' | 'success' | 'primary') => ({
    backgroundColor: colors[`${type}Light`],
    color: colors[type],
  });

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.appName}>Airworthy</Text>
          <Text style={s.headerDate}>Mar 19, 2026</Text>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.label} style={[s.statCard, { borderTopColor: colors[stat.colorKey] }]}>
              <Text style={[s.statValue, { color: colors[stat.colorKey] }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Work Orders */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recent Work Orders</Text>
          {RECENT_WORK_ORDERS.map((wo) => (
            <View key={wo.id} style={s.card}>
              <View style={s.cardRow}>
                <View style={s.cardLeft}>
                  <Text style={s.cardId}>{wo.id}</Text>
                  <Text style={s.cardTail}>{wo.tail}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: statusStyle(wo.statusType).backgroundColor }]}>
                  <Text style={[s.badgeText, { color: statusStyle(wo.statusType).color }]}>
                    {wo.status}
                  </Text>
                </View>
              </View>
              <Text style={s.cardDescription}>{wo.description}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Reminders */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Upcoming Reminders</Text>
          {UPCOMING_REMINDERS.map((r, i) => (
            <View key={i} style={s.card}>
              <View style={s.cardRow}>
                <View style={s.cardLeft}>
                  <Text style={s.cardTail}>{r.tail}</Text>
                  <Text style={s.cardDescription}>{r.type}</Text>
                </View>
                <Text style={s.reminderDue}>{r.due}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 20,
      paddingBottom: 24,
    },
    appName: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: -0.5,
    },
    headerDate: {
      fontSize: 14,
      color: colors.subtext,
      fontWeight: '400',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 28,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      borderTopWidth: 3,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      color: colors.subtext,
      fontWeight: '500',
      lineHeight: 15,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    cardLeft: {
      gap: 2,
    },
    cardId: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },
    cardTail: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.subtext,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    reminderDue: {
      fontSize: 13,
      color: colors.subtext,
      fontWeight: '500',
    },
  });
