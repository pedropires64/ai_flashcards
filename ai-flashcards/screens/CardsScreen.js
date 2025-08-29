// screens/CardsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert, useColorScheme, StyleSheet, FlatList } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getCollectionWithCards, searchCards, setCardMastered, deleteCard } from '../db';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import Tag from '../components/ui/Tag';
import { colors, spacing } from '../theme';

export default function CardsScreen({ route, navigation }) {
  const { collectionId, name } = route.params;
  const dark = useColorScheme() === 'dark';

  // filtros mínimos (ajusta se precisares)
  const [query] = useState('');
  const [filterTags] = useState('');
  const [onlyNotMastered] = useState(false);
  const [order] = useState('newest');

  const [cards, setCards] = useState([]);

  const load = () => {
    const tagList = filterTags.split(',').map(t => t.trim()).filter(Boolean);
    const data = searchCards({ collectionId, query, tagList, onlyNotMastered, order });
    setCards(data);
  };

  useEffect(() => {
    navigation.setOptions({
      title: `Cartões · ${name}`,
      headerRight: () => <AppButton title="Exportar" variant="ghost" size="sm" onPress={exportJson} />,
    });
  }, [navigation, name]);

  useEffect(() => { load(); }, [collectionId]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', load); // volta da criação/edição → refresca
    return unsub;
  }, [navigation]);

  const toggleMastered = async (card) => {
    await setCardMastered(card.id, card.mastered ? 0 : 1);
    load();
  };

  const remove = async (id) => {
    Alert.alert('Apagar cartão', 'Queres mesmo apagar este cartão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => { await deleteCard(id); load(); } }
    ]);
  };

  async function exportJson() {
    const data = getCollectionWithCards(collectionId);
    const json = JSON.stringify(data, null, 2);
    const fileUri = FileSystem.cacheDirectory + `flashcards_${name.replace(/\s+/g,'_')}.json`;
    await FileSystem.writeAsStringAsync(fileUri, json);
    await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
  }

  const renderItem = ({ item }) => (
    <AppCard dark={dark} style={{ marginTop: spacing(1.5) }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ color: dark ? colors.text : colors.textDark, fontWeight:'800', fontSize:16 }}>{item.front}</Text>
        <Text style={{
          paddingHorizontal:10, paddingVertical:4, borderRadius:999,
          backgroundColor: item.mastered ? '#065f46' : '#7f1d1d', color:'#fff', fontSize:12
        }}>
          {item.mastered ? 'Dominado' : 'A rever'}
        </Text>
      </View>

      {item.image_uri ? <Image source={{ uri: item.image_uri }} style={styles.thumb}/> : null}
      <Text style={{ color: dark ? colors.text : colors.textDark, marginTop:8 }}>{item.back}</Text>

      {!!item.tags && (
        <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop:8 }}>
          {item.tags.split(',').map(t => <Tag key={t} text={t} dark={dark}/>)}
        </View>
      )}

      {/* Botões: mesma altura só nestes dois, + Editar a laranja */}
      <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop:12 }}>
        <AppButton
          title={item.mastered ? 'Marcar como a rever' : 'Marcar como dominado'}
          size="sm"
          onPress={() => toggleMastered(item)}
          style={{ marginRight:8, marginBottom:8, minHeight:40 }}
        />
        <AppButton
          title="Editar"
          variant="warning"
          size="sm"
          onPress={() => navigation.navigate('CreateCard', { collectionId, editCard: item })}
          style={{ marginRight:8, marginBottom:8, minHeight:40 }}
        />
        <AppButton
          title="Apagar"
          variant="danger"
          size="sm"
          onPress={() => remove(item.id)}
          style={{ marginBottom:8, minHeight:40 }}
        />
      </View>
    </AppCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: dark ? colors.bg : colors.bgLight }]}>
      {/* Ações principais */}
      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom: spacing(2) }}>
        <AppButton
          title="Estudar"
          onPress={() => navigation.navigate('Study', { collectionId, name })}
          style={{ flex:1, marginRight: 8 }}
        />
        <AppButton
          title="Novo Cartão"
          onPress={() => navigation.navigate('CreateCard', { collectionId })}
          variant="ghost"
          style={{ flex:1, marginLeft: 8 }}
        />
      </View>

      <FlatList
        data={cards}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ color: dark ? colors.textMuted : colors.textMutedDark, textAlign:'center', marginTop: spacing(2) }}>
            Sem cartões.
          </Text>
        }
        onRefresh={load}
        refreshing={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: spacing(2) },
  thumb: { width:'100%', height:140, borderRadius: 12, marginTop: 8, backgroundColor:'#0b1220' },
});