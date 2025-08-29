// screens/CollectionsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, useColorScheme, StyleSheet, TouchableOpacity } from 'react-native';
import { getAllCollectionsWithStats, createCollection, deleteCollection } from '../db';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import ProgressBar from '../components/ui/ProgressBar';
import { colors, spacing } from '../theme';

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState('');
  const dark = useColorScheme() === 'dark';

  const load = async () => setCollections(await getAllCollectionsWithStats());
  useEffect(() => { const un = navigation.addListener('focus', load); return un; }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppButton title="Definições" variant="ghost" size="sm" onPress={() => navigation.navigate('Settings')} />,
    });
  }, [navigation]);

  const add = async () => {
    if (!name.trim()) return;
    await createCollection(name);
    setName('');
    await load();
  };

  const confirmRemove = (id) => {
    Alert.alert('Apagar coleção', 'Queres mesmo apagar esta coleção e todos os cartões?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => { await deleteCollection(id); await load(); } },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Cards', { collectionId: item.id, name: item.name })}
      onLongPress={() => confirmRemove(item.id)}
      style={{ marginTop: spacing(1.5) }}
    >
      <AppCard dark={dark}>
        <Text style={{ color: dark ? colors.text : colors.textDark, fontWeight:'800', fontSize:16 }}>{item.name}</Text>
        <Text style={{ color: dark ? colors.textMuted : colors.textMutedDark, marginTop: 6 }}>
          Dominados: {item.mastered}/{item.total} · {item.percent}%
        </Text>
        <View style={{ marginTop: 10 }}>
          <ProgressBar value={item.percent} dark={dark} />
        </View>
        <Text style={{ color: dark ? colors.textMuted : colors.textMutedDark, marginTop: 10 }}>
          Tocar para abrir · Long press para apagar
        </Text>
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: dark ? colors.bg : colors.bgLight }]}>
      <Text style={[styles.header, { color: dark ? colors.text : colors.textDark }]}>Nova coleção</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <AppInput dark={dark} label="Nome" placeholder="Nome da coleção" value={name} onChangeText={setName} style={{ flex: 1, marginRight: 10 }} />
        <AppButton title="Adicionar" onPress={add} />
      </View>

      <FlatList
        data={collections}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: spacing(2) }}
        ListEmptyComponent={<Text style={{ color: dark ? colors.textMuted : colors.textMutedDark, textAlign: 'center', marginTop: spacing(3) }}>Ainda não tens coleções.</Text>}
      />

      <AppButton title="Importar (.txt / .json)" variant="ghost" onPress={() => navigation.navigate('Import')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing(2) },
  header: { fontSize: 18, fontWeight: '700', marginBottom: spacing(1) },
});