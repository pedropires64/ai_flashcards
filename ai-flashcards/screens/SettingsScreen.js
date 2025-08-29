// screens/SettingsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Alert, FlatList, useColorScheme, StyleSheet } from 'react-native';
import { getReminderSettings, setReminderSettings, getStreak, getStudyLogLastNDays } from '../db';
import { colors, spacing } from '../theme';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';

export default function SettingsScreen() {
  const dark = useColorScheme() === 'dark';
  const [enabled, setEnabled] = useState(true);
  const [hour, setHour] = useState(20);
  const [minute, setMinute] = useState(0);
  const [streak, setStreak] = useState(0);
  const [log, setLog] = useState([]);

  const load = () => {
    const s = getReminderSettings();
    setEnabled(s.enabled); setHour(s.hour); setMinute(s.minute);
    setStreak(getStreak()); setLog(getStudyLogLastNDays(14));
  };
  useEffect(() => { load(); }, []);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, isNaN(v) ? min : v));

  const save = async () => {
    const h = clamp(parseInt(hour,10), 0, 23);
    const m = clamp(parseInt(minute,10), 0, 59);
    setReminderSettings({ enabled, hour: h, minute: m });
    Alert.alert('Guardado', enabled ? `Lembrete diário às ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}` : 'Lembrete desativado');
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', paddingVertical: 6 }}>
      <Text style={{ flex: 1, color: dark ? colors.text : colors.textDark }}>{item.day}</Text>
      <Text style={{ width: 90, textAlign: 'right', color: dark ? colors.text : colors.textDark }}>{item.count}</Text>
    </View>
  );

  return (
    <View style={{ flex:1, padding: spacing(2), backgroundColor: dark ? colors.bg : colors.bgLight }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: dark ? colors.text : colors.textDark }}>Lembrete Diário</Text>

      <AppCard dark={dark} style={{ marginTop: spacing(1) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'space-between' }}>
          <Text style={{ color: dark ? colors.text : colors.textDark, fontWeight:'700' }}>Ativo</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>

        <View style={{ flexDirection:'row', alignItems:'flex-end', gap: 10, marginTop: spacing(1) }}>
          <AppInput label="Hora" value={String(hour)} onChangeText={setHour} keyboardType="number-pad" style={{ width: 90 }} />
          <Text style={{ color: dark ? colors.textMuted : colors.textMutedDark }}>:</Text>
          <AppInput label="Min" value={String(minute)} onChangeText={setMinute} keyboardType="number-pad" style={{ width: 90 }} />
        </View>

        <AppButton title="Guardar lembrete" onPress={save} style={{ marginTop: spacing(1) }} />
      </AppCard>

      <Text style={{ fontSize: 18, fontWeight: '800', color: dark ? colors.text : colors.textDark, marginTop: spacing(2) }}>Estatísticas</Text>
      <AppCard dark={dark} style={{ marginTop: spacing(1) }}>
        <Text style={{ color: dark ? colors.text : colors.textDark, fontWeight:'700' }}>🔥 Streak atual: {streak} dia(s)</Text>
        <Text style={{ color: dark ? colors.textMuted : colors.textMutedDark, marginTop: 8 }}>Atividade (últimos 14 dias)</Text>
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <Text style={{ flex: 1, fontWeight:'700', color: dark ? colors.text : colors.textDark }}>Dia</Text>
          <Text style={{ width: 90, textAlign:'right', fontWeight:'700', color: dark ? colors.text : colors.textDark }}>Respostas</Text>
        </View>
        <FlatList
          data={log}
          keyExtractor={(it) => it.day}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          contentContainerStyle={{ paddingTop: 6 }}
        />
      </AppCard>
    </View>
  );
}