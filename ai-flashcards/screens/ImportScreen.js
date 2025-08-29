// screens/ImportScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, ScrollView, useColorScheme, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { getCollections, createCollection, bulkCreateCards, importCardsFromJson } from '../db';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import { colors, spacing } from '../theme';

export default function ImportScreen({ navigation, route }) {
  const dark = useColorScheme() === 'dark';

  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState(route?.params?.collectionId ?? null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState([]); // [{front,back}]
  const [skipped, setSkipped] = useState(0);
  const [fileType, setFileType] = useState('txt'); // txt|json
  const [jsonObj, setJsonObj] = useState(null);

  const loadCollections = async () => {
    const cols = await getCollections();
    setCollections(cols);
    if (cols.length && !selectedId) setSelectedId(cols[0].id);
  };
  useEffect(() => { const un = navigation.addListener('focus', loadCollections); return un; }, [navigation]);

  const createAndUseCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;
    await createCollection(name);
    setNewCollectionName('');
    const cols = await getCollections(); setCollections(cols);
    if (cols.length) setSelectedId(cols[0].id);
  };

  const pickFile = async () => {
    setParsed([]); setSkipped(0); setFileName(''); setJsonObj(null);
    const res = await DocumentPicker.getDocumentAsync({ type: ['text/plain','application/json'], multiple: false, copyToCacheDirectory: true });
    if (res.canceled) return;
    const file = res.assets?.[0]; if (!file) return;

    setFileName(file.name || 'ficheiro');
    const content = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });

    if (file.name?.toLowerCase().endsWith('.json') || file.mimeType === 'application/json') {
      setFileType('json');
      try { setJsonObj(JSON.parse(content)); } catch { Alert.alert('Erro', 'JSON inválido.'); }
      return;
    }

    setFileType('txt');
    const lines = content.split(/\r?\n/);
    const pairs = []; let skip = 0;
    for (const raw of lines) {
      const line = (raw ?? '').trim(); if (!line) continue;
      const i = line.indexOf('|'); if (i === -1) { skip++; continue; }
      const front = line.slice(0,i).trim();
      const back  = line.slice(i+1).trim();
      if (!front || !back) { skip++; continue; }
      pairs.push({ front, back });
    }
    setParsed(pairs); setSkipped(skip);
  };

  const doImport = async () => {
    if (!selectedId) return Alert.alert('Seleciona ou cria uma coleção primeiro.');
    try {
      if (fileType === 'json' && jsonObj) {
        importCardsFromJson(selectedId, jsonObj);
        Alert.alert('Importação JSON concluída', `Cartões importados para a coleção.`);
      } else if (parsed.length) {
        bulkCreateCards(selectedId, parsed);
        Alert.alert('Importação .txt concluída', `${parsed.length} cartões importados.\nIgnorados: ${skipped}`);
      } else {
        Alert.alert('Nada para importar');
        return;
      }
      setParsed([]); setSkipped(0); setFileName(''); setJsonObj(null);
      navigation.navigate('Cards', { collectionId: selectedId, name: collections.find(c => c.id === selectedId)?.name ?? 'Coleção' });
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falhou a importação.');
    }
  };

  const CollectionItem = ({ item }) => (
    <AppCard dark={dark} style={{ marginBottom: spacing(1) }}>
      <Text
        onPress={() => setSelectedId(item.id)}
        style={{ color: dark ? colors.text : colors.textDark, fontWeight: '700' }}
      >
        {selectedId === item.id ? '• ' : ''}{item.name}
      </Text>
    </AppCard>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: dark ? colors.bg : colors.bgLight }]}>
      <Text style={[styles.title, { color: dark ? colors.text : colors.textDark }]}>Importar (.txt ou .json)</Text>

      <Text style={[styles.section, { color: dark ? colors.text : colors.textDark }]}>1) Escolhe uma coleção</Text>
      <FlatList data={collections} keyExtractor={(it) => String(it.id)} renderItem={CollectionItem} scrollEnabled={false} />

      <View style={{ marginTop: spacing(1.5) }}>
        <Text style={[styles.section, { color: dark ? colors.text : colors.textDark }]}>…ou cria nova e usa</Text>
        <View style={{ flexDirection:'row', alignItems:'flex-end', gap: 10 }}>
          <AppInput label="Nome" placeholder="Nome da nova coleção" value={newCollectionName} onChangeText={setNewCollectionName} dark={dark} style={{ flex: 1 }} />
          <AppButton title="Criar e usar" onPress={createAndUseCollection} />
        </View>
      </View>

      <View style={{ marginTop: spacing(2) }}>
        <Text style={[styles.section, { color: dark ? colors.text : colors.textDark }]}>2) Escolhe o ficheiro</Text>
        <AppButton title="Escolher .txt / .json" variant="ghost" onPress={pickFile} />
        {fileName ? <Text style={{ color: dark ? colors.textMuted : colors.textMutedDark, marginTop: 6 }}>Selecionado: {fileName}</Text> : null}
        <Text style={{ color: dark ? colors.textMuted : colors.textMutedDark, marginTop: 6 }}>
          .txt: uma linha por cartão, usar " | " como separador. Ex.: Frente | Verso
        </Text>
      </View>

      {fileType === 'txt' && parsed.length > 0 && (
        <View style={{ marginTop: spacing(1.5) }}>
          <Text style={{ color: dark ? colors.text : colors.textDark, fontWeight: '700' }}>
            Linhas válidas: {parsed.length} {skipped ? `· Ignoradas: ${skipped}` : ''}
          </Text>
          {parsed.slice(0, 3).map((p, i) => (
            <Text key={i} style={{ color: dark ? colors.textMuted : colors.textMutedDark, marginTop: 4 }}>
              • {p.front} | {p.back}
            </Text>
          ))}
        </View>
      )}

      {fileType === 'json' && jsonObj && (
        <View style={{ marginTop: spacing(1.5) }}>
          <Text style={{ color: dark ? colors.text : colors.textDark, fontWeight: '700' }}>
            JSON válido — cartões: {jsonObj?.cards?.length ?? 0}
          </Text>
        </View>
      )}

      <View style={{ marginTop: spacing(2), marginBottom: spacing(4) }}>
        <AppButton title="Importar para a coleção selecionada" onPress={doImport} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(2) },
  title: { fontSize: 20, fontWeight: '800', marginBottom: spacing(1) },
  section: { fontSize: 16, fontWeight: '700', marginTop: spacing(1), marginBottom: 6 },
});