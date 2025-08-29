// screens/CreateCardScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Alert, useColorScheme, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createCard, updateCard } from '../db';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../theme';

export default function CreateCardScreen({ route, navigation }) {
  const { collectionId, editCard } = route.params ?? {};
  const dark = useColorScheme() === 'dark';

  // modo edição?
  const isEditing = useMemo(() => !!editCard, [editCard]);

  const [front, setFront] = useState(editCard?.front ?? '');
  const [back,  setBack]  = useState(editCard?.back  ?? '');
  const [tags,  setTags]  = useState(editCard?.tags  ?? '');
  const [imageUri, setImageUri] = useState(editCard?.image_uri ?? null);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar Cartão' : 'Novo Cartão' });
  }, [navigation, isEditing]);

  const pickImage = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { Alert.alert('Permissão necessária', 'Autoriza o acesso à galeria.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const save = async () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert('Erro', 'Preenche frente e verso.');
      return;
    }
    try {
      if (isEditing) {
        await updateCard(editCard.id, { front, back, tags, image_uri: imageUri });
      } else {
        await createCard(collectionId, front, back, tags, imageUri);
      }
      navigation.goBack(); // CardsScreen dá refresh no focus
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível guardar o cartão.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: dark ? colors.bg : colors.bgLight }]}>
      <Text style={[styles.header, { color: dark ? colors.text : colors.textDark }]}>
        {isEditing ? 'Editar Cartão' : 'Novo Cartão'}
      </Text>

      <AppInput dark={dark} label="Frente" placeholder="Pergunta / termo" value={front} onChangeText={setFront} />
      <AppInput dark={dark} label="Verso"  placeholder="Resposta / definição" value={back} onChangeText={setBack} />
      <AppInput dark={dark} label="Tags"   placeholder="Separadas por vírgulas (ex.: vocab,gramática)" value={tags} onChangeText={setTags} />

      <View style={{ flexDirection:'row', gap: 10, marginTop: spacing(1) }}>
        <AppButton title={imageUri ? 'Trocar imagem' : 'Adicionar imagem'} variant="ghost" onPress={pickImage} />
        {imageUri ? <AppButton title="Remover imagem" variant="danger" onPress={() => setImageUri(null)} /> : null}
      </View>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.thumb}/> : null}

      <AppButton title={isEditing ? 'Guardar alterações' : 'Guardar'} onPress={save} style={{ marginTop: spacing(2) }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: spacing(2) },
  header: { fontSize: 18, fontWeight: '800', marginBottom: spacing(1) },
  thumb: { width:'100%', height:140, borderRadius: 12, marginTop: 8, backgroundColor:'#0b1220' },
});