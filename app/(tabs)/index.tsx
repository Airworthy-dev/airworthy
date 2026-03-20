import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { daysLabel, daysUntil, formatDate, urgencyFromDays } from '@/utils/dates';

const STATUS_CONFIG = {
  open: { label: 'Open', colorKey: 'danger' as const },
  'in-progress': { label: 'In Progress', colorKey: 'warning' as const },
  complete: { label: 'Complete', colorKey: 'success' as const },
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { workOrders, aircraft, reminders } = useStore();

  const openWO = workOrders.filter((w) => w.status !== 'complete').length;
  const activeAC = aircraft.filter((a) => a.status === 'airworthy').length;
  const dueReminders = reminders.filter((r) => {
    const days = daysUntil(r.dueDate);
    return days < 0 || days <= 30;
  }).length;

  const recentWOs = workOrders.slice(0, 3);
  const upcomingReminders = [...reminders]
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))
    .slice(0, 3);

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.appName}>Airworthy</Text>
          <Text style={s.headerDate}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </View>

        <View style={s.statsRow}>
          {[
            { label: 'Open\nWork Orders', value: openWO, colorKey: 'warning' as const },
            { label: 'Active\nAircraft', value: activeAC, colorKey: 'primary' as const },
            { label: 'Due This\nMonth', value: dueReminders, colorKey: 'danger' as const },
          ].map((stat) => (
            <View key={stat.label} style={[s.statCard, { borderTopColor: colors[stat.colorKey] }]}>
              <Text style={[s.statValue, { color: colors[stat.colorKey] }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Recent Work Orders</Text>
          {recentWOs.map((wo) => {
            const cfg = STATUS_CONFIG[wo.status];
            return (
              <TouchableOpacity key={wo.id} style={s.card} activeOpacity={0.7} onPress={() => router.push(`/work-order/${wo.id}`)}>
                <View style={s.cardRow}>
                  <View>
                    <Text style={s.cardId}>{wo.id}</Text>
                    <Text style={s.cardTail}>{wo.tail}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: colors[`${cfg.colorKey}Light`] }]}>
                    <Text style={[s.badgeText, { color: colors[cfg.colorKey] }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={s.cardDescription}>{wo.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Upcoming Reminders</Text>
          {upcomingReminders.map((r) => {
            const days = daysUntil(r.dueDate);
            const urgency = urgencyFromDays(days);
            const accentColor = urgency === 'overdue' ? colors.danger : urgency === 'soon' ? colors.warning : colors.subtext;
            return (
              <TouchableOpacity key={r.id} style={s.card} activeOpacity={0.7} onPress={() => router.push(`/reminder/${r.id}`)}>
                <View style={s.cardRow}>
                  <View>
                    <Text style={s.cardTail}>{r.tail}</Text>
                    <Text style={s.cardDescription}>{r.type}</Text>
                  </View>
                  <Text style={[s.reminderDue, { color: accentColor }]}>{daysLabel(days)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    content: { paddingHorizontal: 20, paddingBottom: 32 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 24 },
    appName: { fontSize: 26, fontWeight: '700', color: colors.primary, letterSpacing: -0.5 },
    headerDate: { fontSize: 14, color: colors.subtext },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 14, borderTopWidth: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    statValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
    statLabel: { fontSize: 11, color: colors.subtext, fontWeight: '500', lineHeight: 15 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 12 },
    card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    cardId: { fontSize: 13, fontWeight: '600', color: colors.primary },
    cardTail: { fontSize: 15, fontWeight: '600', color: colors.text },
    cardDescription: { fontSize: 14, color: colors.subtext },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    reminderDue: { fontSize: 13, fontWeight: '600' },
  });
