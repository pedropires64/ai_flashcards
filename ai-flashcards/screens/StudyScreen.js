// screens/StudyScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, useColorScheme, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getCardsByCollection, setCardMastered, registerStudyActivity, getStreak } from '../db';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import { colors, spacing } from '../theme';

const CARD_HEIGHT = 220;

export default function StudyScreen({ route, navigation }) {
  const { collectionId, name } = route.params;
  const dark = useColorScheme() === 'dark';

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);

  // Flip animation: 0 = frente, 1 = verso
  const [isFront, setIsFront] = useState(true);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    const all = await getCardsByCollection(collectionId);
    const notMastered = all.filter(c => !c.mastered);
    const mastered = all.filter(c => c.mastered);
    const arr = [...notMastered, ...mastered].sort(() => Math.random() - 0.5);
    setCards(arr);
    setIndex(0);
    setIsFront(true);
    flipAnim.setValue(0); // garantir que começa na frente
    setStreak(getStreak());
  }, [collectionId, flipAnim]);

  useEffect(() => { navigation.setOptions({ title: `Estudar · ${name}` }); }, [navigation, name]);
  useEffect(() => { load(); }, [load]);

  if (!cards.length) {
    return (
      <View style={[styles.container, { backgroundColor: dark ? colors.bg : colors.bgLight }]}>
        <Text style={{ color: dark ? colors.text : colors.textDark }}>Não há cartões nesta coleção.</Text>
      </View>
    );
  }

  const card = cards[index];

  // ---- Flip handlers ----
  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: isFront ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setIsFront(!isFront));
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const goNext = () => {
    setIsFront(true);
    flipAnim.setValue(0); // reset para a frente
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const onHit = async () => {
    await setCardMastered(card.id, 1);
    registerStudyActivity();
    setStreak(getStreak());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    goNext();
  };

  const onMiss = async () => {
    await setCardMastered(card.id, 0);
    registerStudyActivity();
    setStreak(getStreak());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    goNext();
  };

  return (
    <View style={[styles.container, { backgroundColor: dark ? colors.bg : colors.bgLight }]}>
      <Text style={[styles.streak, { color: dark ? colors.text : colors.textDark }]}>🔥 Streak: {streak} dia(s)</Text>

      {/* Card centrado; tap em qualquer parte vira com flip */}
      <View style={styles.centerWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={{ width: '100%' }}>
          <AppCard dark={dark} style={[styles.card, { height: CARD_HEIGHT }]}>
            {/* stack de frente e verso com rotação Y */}
            <View style={{ width: '100%', height: '100%' }}>
              {/* Frente */}
              <Animated.View
                pointerEvents={isFront ? 'auto' : 'none'}
                style={[
                  styles.flipSide,
                  { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
                ]}
              >
                <Text style={[styles.sideLabel, { color: dark ? colors.textMuted : colors.textMutedDark }]}>Frente</Text>
                {card.image_uri ? <Image source={{ uri: card.image_uri }} style={styles.image}/> : null}
                <Text
                  style={[
                    styles.cardText,
                    { color: dark ? colors.text : colors.textDark }
                  ]}
                >
                  {card.front}
                </Text>
                <Text style={[styles.tip, { color: dark ? colors.textMuted : colors.textMutedDark }]}>
                  Toca para virar
                </Text>
              </Animated.View>

              {/* Verso */}
              <Animated.View
                pointerEvents={!isFront ? 'auto' : 'none'}
                style={[
                  styles.flipSide,
                  styles.flipBack,
                  { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
                ]}
              >
                <Text style={[styles.sideLabel, { color: dark ? colors.textMuted : colors.textMutedDark }]}>Verso</Text>
                {card.image_uri ? <Image source={{ uri: card.image_uri }} style={styles.image}/> : null}
                <Text
                  style={[
                    styles.cardText,
                    { color: dark ? colors.text : colors.textDark }
                  ]}
                >
                  {card.back}
                </Text>
                <Text style={[styles.tip, { color: dark ? colors.textMuted : colors.textMutedDark }]}>
                  Toca para virar
                </Text>
              </Animated.View>
            </View>
          </AppCard>
        </TouchableOpacity>

        {/* botões imediatamente por baixo do card, centrados */}
        <View style={styles.actionsInline}>
          <AppButton title="Acertei" onPress={onHit} size="sm" />
          <AppButton title="Errei" onPress={onMiss} size="sm" variant="danger" />
        </View>
      </View>

      <Text style={{ marginTop: spacing(1), color: dark ? colors.textMuted : colors.textMutedDark }}>
        {index + 1} / {cards.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: spacing(2), alignItems:'center' },
  streak: { fontWeight:'800', marginTop: 6 },
  centerWrap: {
    flex:1,
    justifyContent:'center',   // centra verticalmente o bloco do card
    alignItems:'center',
    width:'100%',
  },
  card: { alignItems:'center', justifyContent:'center', overflow:'hidden' },

  // faces para o flip
  flipSide: {
    position:'absolute', top:0, left:0, right:0, bottom:0,
    alignItems:'center', justifyContent:'center',
    backfaceVisibility:'hidden',
    paddingHorizontal: spacing(2),
  },
  flipBack: { transform:[{ rotateY:'180deg' }] },

  sideLabel: { fontSize:12 },
  cardText: { fontSize:20, fontWeight:'800', textAlign:'center', marginVertical: spacing(1.5) },
  tip: { fontSize:12 },

  image: { width:'100%', height: 140, borderRadius: 14, marginTop: 10, backgroundColor:'#0b1220' },

  actionsInline: { flexDirection:'row', justifyContent:'center', alignItems:'center', gap:12, marginTop: spacing(1.5) },
});