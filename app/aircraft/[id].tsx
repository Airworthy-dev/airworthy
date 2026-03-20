import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { Aircraft, AircraftStatus } from '@/store/types';
import { formatDate } from '@/utils/dates';

const STATUS_OPTIONS: AircraftStatus[] = ['airworthy', 'maintenance', 'grounded'];
const STATUS_LABELS: Record<AircraftStatus, string> = { airworthy: 'Airworthy', maintenance: 'In Maintenance', grounded: 'Grounded' };
const STATUS_COLORS: Record<AircraftStatus, 'success' | 'warning' | 'danger'> = { airworthy: 'success', maintenance: 'warning', grounded: 'danger' };

export default function AircraftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { aircraft, workOrders, reminders, updateAircraft, deleteAircraft } = useStore();

  const ac = aircraft.find((a) => a.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Aircraft | null>(null);

  useEffect(() => {
    if (ac) setForm({ ...ac });
  }, [ac]);

  if (!ac || !form) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.empty}><Text style={s.emptyText}>Aircraft not found</Text></View>
      </SafeAreaView>
    );
  }

  const colorKey = STATUS_COLORS[ac.status];
  const relatedWOs = workOrders.filter((wo) => wo.tail === ac.tail).slice(0, 3);
  const relatedReminders = reminders.filter((r) => r.tail === ac.tail);

  const handleSave = () => {
    updateAircraft(id!, { ...form, totalTime: Number(form.totalTime) });
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Aircraft', `Remove ${ac.tail} from your fleet?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteAircraft(id!); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.topRow}>
          <View>
            <Text style={s.tail}>{ac.tail}</Text>
            <Text style={s.makeModel}>{ac.year} {ac.make} {ac.model}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: colors[`${colorKey}Light`] }]}>
            <Text style={[s.statusText, { color: colors[colorKey] }]}>{STATUS_LABELS[ac.status]}</Text>
          </View>
        </View>

        {editing ? (
          <>
            <Field label="Make" colors={colors}>
              <TextInput style={s.input} value={form.make} onChangeText={(v) => setForm({ ...form, make: v })} placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Model" colors={colors}>
              <TextInput style={s.input} value={form.model} onChangeText={(v) => setForm({ ...form, model: v })} placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Year" colors={colors}>
              <TextInput style={s.input} value={String(form.year)} onChangeText={(v) => setForm({ ...form, year: parseInt(v) || form.year })} keyboardType="number-pad" placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Total Time (hours)" colors={colors}>
              <TextInput style={s.input} value={String(form.totalTime)} onChangeText={(v) => setForm({ ...form, totalTime: parseFloat(v) || form.totalTime })} keyboardType="decimal-pad" placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Last Inspection (YYYY-MM-DD)" colors={colors}>
              <TextInput style={s.input} value={form.lastInspection} onChangeText={(v) => setForm({ ...form, lastInspection: v })} placeholder="2026-01-12" placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Next Due (YYYY-MM-DD)" colors={colors}>
              <TextInput style={s.input} value={form.nextDue} onChangeText={(v) => setForm({ ...form, nextDue: v })} placeholder="2027-01-12" placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Status" colors={colors}>
              <View style={s.optionRow}>
                {STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt} style={[s.optionChip, form.status === opt && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setForm({ ...form, status: opt })}>
                    <Text style={[s.optionChipText, form.status === opt && { color: '#fff' }]}>{STATUS_LABELS[opt]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <Field label="Notes" colors={colors}>
              <TextInput style={[s.input, s.textarea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline numberOfLines={4} placeholder="Optional notes…" placeholderTextColor={colors.subtext} />
            </Field>
            <View style={s.buttonRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setForm({ ...ac }); setEditing(false); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={s.statsRow}>
              {[
                { label: 'Total Time', value: `${ac.totalTime.toLocaleString()} hrs` },
                { label: 'Last Inspection', value: formatDate(ac.lastInspection) },
                { label: 'Next Due', value: formatDate(ac.nextDue) },
              ].map((stat) => (
                <View key={stat.label} style={s.statCard}>
                  <Text style={s.statLabel}>{stat.label}</Text>
                  <Text style={s.statValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
            {ac.notes ? <InfoRow label="Notes" value={ac.notes} s={s} /> : null}

            {relatedWOs.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Work Orders</Text>
                {relatedWOs.map((wo) => (
                  <TouchableOpacity key={wo.id} style={s.relatedCard} onPress={() => router.push(`/work-order/${wo.id}`)}>
                    <Text style={[s.relatedId, { color: colors.primary }]}>{wo.id}</Text>
                    <Text style={s.relatedDesc}>{wo.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {relatedReminders.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Reminders</Text>
                {relatedReminders.map((r) => (
                  <TouchableOpacity key={r.id} style={s.relatedCard} onPress={() => router.push(`/reminder/${r.id}`)}>
                    <Text style={s.relatedDesc}>{r.type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={s.buttonRow}>
              <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)}>
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
                <Text style={s.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.subtext, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, s }: { label: string; value: string; s: any }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    tail: { fontSize: 26, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
    makeModel: { fontSize: 14, color: colors.subtext, marginTop: 2 },
    statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontSize: 13, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border },
    statLabel: { fontSize: 10, color: colors.subtext, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
    statValue: { fontSize: 13, fontWeight: '700', color: colors.text },
    infoRow: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    infoLabel: { fontSize: 12, color: colors.subtext, fontWeight: '500', marginBottom: 4 },
    infoValue: { fontSize: 15, fontWeight: '500', color: colors.text },
    section: { marginTop: 16, marginBottom: 8 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 },
    relatedCard: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    relatedId: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
    relatedDesc: { fontSize: 14, color: colors.text, fontWeight: '500' },
    input: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
    textarea: { height: 100, textAlignVertical: 'top' },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    optionChipText: { fontSize: 13, fontWeight: '500', color: colors.subtext },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
    editBtn: { flex: 1, backgroundColor: colors.primaryLight, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    editBtnText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
    deleteBtn: { flex: 1, backgroundColor: colors.dangerLight, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    deleteBtnText: { color: colors.danger, fontWeight: '600', fontSize: 16 },
    saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    cancelBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    cancelBtnText: { color: colors.subtext, fontWeight: '600', fontSize: 16 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 16, color: colors.subtext },
  });
