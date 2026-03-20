import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { ReminderCategory } from '@/store/types';
import { todayISO } from '@/utils/dates';

const CATEGORY_OPTIONS: ReminderCategory[] = ['Inspection', 'Avionics', 'Engine', 'Equipment'];

export default function NewReminderScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { addReminder } = useStore();

  const [form, setForm] = useState({
    tail: '',
    type: '',
    category: 'Inspection' as ReminderCategory,
    dueDate: todayISO(),
    notes: '',
  });

  const canSave = form.tail.trim() && form.type.trim() && form.dueDate.trim();

  const handleSave = () => {
    if (!canSave) return;
    addReminder(form);
    router.back();
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Field label="Type" colors={colors}>
          <TextInput style={s.input} value={form.type} onChangeText={(v) => setForm({ ...form, type: v })} placeholder="e.g. Annual Inspection" placeholderTextColor={colors.subtext} />
        </Field>
        <Field label="Tail Number" colors={colors}>
          <TextInput style={s.input} value={form.tail} onChangeText={(v) => setForm({ ...form, tail: v.toUpperCase() })} placeholder="e.g. N182TW" placeholderTextColor={colors.subtext} autoCapitalize="characters" />
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
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.saveBtn, !canSave && s.saveBtnDisabled]} onPress={handleSave} disabled={!canSave}>
            <Text style={s.saveBtnText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>
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

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    input: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
    textarea: { height: 100, textAlignVertical: 'top' },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    optionChipText: { fontSize: 13, fontWeight: '500', color: colors.subtext },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    cancelBtnText: { color: colors.subtext, fontWeight: '600', fontSize: 16 },
    saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  });
