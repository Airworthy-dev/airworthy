import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { Reminder, ReminderCategory } from '@/store/types';
import { daysLabel, daysUntil, formatDate, urgencyFromDays } from '@/utils/dates';

const CATEGORY_OPTIONS: ReminderCategory[] = ['Inspection', 'Avionics', 'Engine', 'Equipment'];
const URGENCY_COLORS = { overdue: '#C62828', soon: '#E65100', upcoming: '#1565C0' };

export default function ReminderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { reminders, updateReminder, deleteReminder } = useStore();

  const reminder = reminders.find((r) => r.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Reminder | null>(null);

  useEffect(() => {
    if (reminder) setForm({ ...reminder });
  }, [reminder]);

  if (!reminder || !form) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.empty}><Text style={s.emptyText}>Reminder not found</Text></View>
      </SafeAreaView>
    );
  }

  const days = daysUntil(reminder.dueDate);
  const urgency = urgencyFromDays(days);
  const accentColor = URGENCY_COLORS[urgency];

  const handleSave = () => {
    updateReminder(id!, form);
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Reminder', `Delete this reminder for ${reminder.tail}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteReminder(id!); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={[s.urgencyBanner, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
          <Text style={[s.urgencyLabel, { color: accentColor }]}>{daysLabel(days)}</Text>
          <Text style={[s.urgencyDue, { color: accentColor }]}>{formatDate(reminder.dueDate)}</Text>
        </View>

        {editing ? (
          <>
            <Field label="Type" colors={colors}>
              <TextInput style={s.input} value={form.type} onChangeText={(v) => setForm({ ...form, type: v })} placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Tail Number" colors={colors}>
              <TextInput style={s.input} value={form.tail} onChangeText={(v) => setForm({ ...form, tail: v.toUpperCase() })} autoCapitalize="characters" placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Due Date (YYYY-MM-DD)" colors={colors}>
              <TextInput style={s.input} value={form.dueDate} onChangeText={(v) => setForm({ ...form, dueDate: v })} placeholder="2026-04-01" placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Category" colors={colors}>
              <View style={s.optionRow}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt} style={[s.optionChip, form.category === opt && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setForm({ ...form, category: opt })}>
                    <Text style={[s.optionChipText, form.category === opt && { color: '#fff' }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <Field label="Notes" colors={colors}>
              <TextInput style={[s.input, s.textarea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline numberOfLines={4} placeholder="Optional notes…" placeholderTextColor={colors.subtext} />
            </Field>
            <View style={s.buttonRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setForm({ ...reminder }); setEditing(false); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <InfoRow label="Type" value={reminder.type} s={s} />
            <InfoRow label="Aircraft" value={reminder.tail} s={s} accent colors={colors} onPress={() => router.push(`/aircraft/${reminder.tail}`)} />
            <InfoRow label="Category" value={reminder.category} s={s} />
            {reminder.notes ? <InfoRow label="Notes" value={reminder.notes} s={s} /> : null}
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

function InfoRow({ label, value, s, accent, colors, onPress }: { label: string; value: string; s: any; accent?: boolean; colors?: any; onPress?: () => void }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <TouchableOpacity disabled={!onPress} onPress={onPress}>
        <Text style={[s.infoValue, accent && colors && { color: colors.primary }]}>{value}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    urgencyBanner: { borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    urgencyLabel: { fontSize: 16, fontWeight: '700' },
    urgencyDue: { fontSize: 14, fontWeight: '500' },
    infoRow: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    infoLabel: { fontSize: 13, color: colors.subtext, fontWeight: '500' },
    infoValue: { fontSize: 15, fontWeight: '600', color: colors.text },
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
