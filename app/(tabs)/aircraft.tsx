import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AircraftStatus = 'airworthy' | 'grounded' | 'maintenance';

interface Aircraft {
  tail: string;
  make: string;
  model: string;
  year: number;
  status: AircraftStatus;
  lastInspection: string;
  nextDue: string;
  totalTime: string;
}

const AIRCRAFT: Aircraft[] = [
  { tail: 'N182TW', make: 'Cessna', model: '182 Skylane', year: 2004, status: 'airworthy', lastInspection: 'Jan 12, 2026', nextDue: 'Jan 12, 2027', totalTime: '4,218 hrs' },
  { tail: 'N44XA', make: 'Piper', model: 'PA-28 Cherokee', year: 1998, status: 'maintenance', lastInspection: 'Oct 3, 2025', nextDue: 'Oct 3, 2026', totalTime: '7,841 hrs' },
  { tail: 'N8801B', make: 'Beechcraft', model: 'Bonanza G36', year: 2011, status: 'airworthy', lastInspection: 'Feb 20, 2026', nextDue: 'Feb 20, 2027', totalTime: '2,105 hrs' },
  { tail: 'N7762C', make: 'Cessna', model: '172 Skyhawk', year: 2001, status: 'airworthy', lastInspection: 'Dec 15, 2025', nextDue: 'Dec 15, 2026', totalTime: '5,632 hrs' },
  { tail: 'N55KL', make: 'Piper', model: 'PA-44 Seminole', year: 2008, status: 'grounded', lastInspection: 'Sep 9, 2025', nextDue: 'Sep 9, 2026', totalTime: '3,390 hrs' },
  { tail: 'N2209F', make: 'Diamond', model: 'DA40-XLS', year: 2015, status: 'airworthy', lastInspection: 'Mar 1, 2026', nextDue: 'Mar 1, 2027', totalTime: '1,788 hrs' },
];

const STATUS_CONFIG = {
  airworthy: { label: 'Airworthy', colorKey: 'success' as const },
  maintenance: { label: 'In Maintenance', colorKey: 'warning' as const },
  grounded: { label: 'Grounded', colorKey: 'danger' as const },
};

export default function AircraftScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);

  const [search, setSearch] = useState('');

  const filtered = AIRCRAFT.filter((ac) => {
    const q = search.toLowerCase();
    return (
      !q ||
      ac.tail.toLowerCase().includes(q) ||
      ac.make.toLowerCase().includes(q) ||
      ac.model.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <Text style={s.title}>Aircraft</Text>
        <TouchableOpacity style={s.newButton}>
          <Text style={s.newButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchContainer}>
        <TextInput
          style={s.searchInput}
          placeholder="Search by tail number or make…"
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Summary pills */}
      <View style={s.summaryRow}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = AIRCRAFT.filter((a) => a.status === key).length;
          return (
            <View key={key} style={[s.summaryPill, { backgroundColor: colors[`${cfg.colorKey}Light`] }]}>
              <Text style={[s.summaryCount, { color: colors[cfg.colorKey] }]}>{count}</Text>
              <Text style={[s.summaryLabel, { color: colors[cfg.colorKey] }]}>{cfg.label}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((ac) => {
          const cfg = STATUS_CONFIG[ac.status];
          return (
            <TouchableOpacity key={ac.tail} style={s.card} activeOpacity={0.7}>
              <View style={s.cardTop}>
                <View>
                  <Text style={s.tailNumber}>{ac.tail}</Text>
                  <Text style={s.makeModel}>{ac.year} {ac.make} {ac.model}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: colors[`${cfg.colorKey}Light`] }]}>
                  <Text style={[s.badgeText, { color: colors[cfg.colorKey] }]}>{cfg.label}</Text>
                </View>
              </View>
              <View style={s.divider} />
              <View style={s.detailsRow}>
                <View style={s.detail}>
                  <Text style={s.detailLabel}>Total Time</Text>
                  <Text style={s.detailValue}>{ac.totalTime}</Text>
                </View>
                <View style={s.detail}>
                  <Text style={s.detailLabel}>Last Inspection</Text>
                  <Text style={s.detailValue}>{ac.lastInspection}</Text>
                </View>
                <View style={s.detail}>
                  <Text style={s.detailLabel}>Next Due</Text>
                  <Text style={s.detailValue}>{ac.nextDue}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    newButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    newButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    searchInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 16,
    },
    summaryPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 10,
    },
    summaryCount: {
      fontSize: 16,
      fontWeight: '700',
    },
    summaryLabel: {
      fontSize: 11,
      fontWeight: '600',
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 10,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    tailNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    makeModel: {
      fontSize: 14,
      color: colors.subtext,
      marginTop: 2,
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
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    detail: {
      alignItems: 'flex-start',
    },
    detailLabel: {
      fontSize: 11,
      color: colors.subtext,
      fontWeight: '500',
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    detailValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
  });
