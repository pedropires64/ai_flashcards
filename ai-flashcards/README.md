# AI FlashCards

Aplicação mobile (React Native + Expo) para criação e estudo de flashcards, com organização por coleções, importação/exportação de ficheiros e notificações diárias.  
Projeto desenvolvido no âmbito da **Proposta 6 – AI FlashCards**.

---

## Funcionalidades

- **Coleções**
  - Criar e apagar coleções de cartões.
  - Visualização do progresso (dominados vs total).
  - Barra de progresso e percentagem.

- **Cartões**
  - Criar novos cartões (frente, verso, tags, imagem opcional).
  - Editar cartões existentes.
  - Apagar cartões.
  - Marcar cartões como **dominados** ou **a rever**.

- **Estudo**
  - Ecrã de estudo dedicado.
  - Cartões com **flip animation 3D** ao toque.
  - Botões rápidos "Acertei" (verde) e "Errei" (vermelho).
  - Contador de **streak diário**.

- **Importação / Exportação**
  - Importar coleções e cartões a partir de ficheiros `.txt` ou `.json`.
  - Exportar coleções completas para `.json`.

- **Notificações**
  - Lembrete diário configurável (hora e minuto).
  - Agendamento automático mesmo após reinício.

- **UI/UX**
  - Modo claro/escuro (automático).
  - Botões consistentes com variantes (`primary`, `danger`, `warning`, `ghost`).
  - Layout responsivo para iOS e Android.
  - Ações intuitivas (Estudar / Novo Cartão sempre visíveis).

---

## Tecnologias

- [Expo](https://expo.dev/) (SDK 53)
- [React Native](https://reactnative.dev/)
- [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
- [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)

---

## Estrutura do Projeto

```
ai-flashcards/
├── App.js
├── db.js
├── theme.js
├── screens/
│   ├── CollectionsScreen.js
│   ├── CardsScreen.js
│   ├── StudyScreen.js
│   ├── CreateCardScreen.js
│   ├── ImportScreen.js
│   └── SettingsScreen.js
└── components/ui/
    ├── AppButton.js
    ├── AppCard.js
    ├── AppInput.js
    ├── ProgressBar.js
    └── Tag.js
```

---

## Instalação

### 1. Clonar o projeto
```bash
git clone <url-do-repo>
cd ai-flashcards
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Instalar pacotes Expo específicos
```bash
npx expo install expo-notifications expo-sqlite expo-image-picker expo-file-system expo-sharing expo-haptics react-native-gesture-handler
```

### 4. Executar
```bash
npx expo start -c
```

- No iOS → abre o **Camera app** e lê o QRCode.  
- No Android → abre a app **Expo Go** e lê o QRCode.  

---

## Importação de cartões

### Estrutura `.txt` suportada:
```
# Nome da coleção 1
Q: Pergunta 1
A: Resposta 1

Q: Pergunta 2
A: Resposta 2

# Nome da coleção 2
Q: Outra pergunta
A: Outra resposta
```

- Cada `#` cria uma **nova coleção**.
- Linhas `Q:` e `A:` criam cartões.
- Linhas em branco separam cartões.

Importar pelo botão **Importar (.txt/.json)** na página de coleções.

---

## Exportação

- Cada coleção pode ser exportada como `.json` (inclui imagem e estado de cada cartão).
- Usa o botão **Exportar** na página da coleção.

---

## Notificações

- Definidas nas **Definições & Estatísticas**.
- É possível ativar/desativar e escolher a hora.
- Guardadas localmente em SQLite e reagendadas sempre que a app abre.

---

## Dependências e para que servem

- **expo-notifications** → notificações locais.  
- **expo-sqlite** → base de dados local.  
- **expo-image-picker** → escolher imagens da galeria.  
- **expo-file-system** → manipulação de ficheiros (import/export).  
- **expo-sharing** → partilha de ficheiros.  
- **expo-haptics** → vibração/feedback tátil.  
- **react-native-gesture-handler** → suporte a gestos (necessário na navegação).  

---

## Troubleshooting

- **Erro `Unable to resolve module ...`**  
  → Corre `npx expo install <pacote>` para instalar dependências em falta.

- **Notificações não aparecem (iOS)**  
  → Testa num dispositivo físico (iOS Simulator não suporta notificações locais).

- **Importação .txt não cria coleções**  
  → Confirma se o ficheiro segue o formato `# Nome da coleção` + `Q:`/`A:`.

---

## Checklist do Enunciado

- [x] Criar / editar / apagar cartões  
- [x] Organizar cartões em coleções  
- [x] Importar `.txt`  
- [x] Exportar `.json`  
- [x] Estudar com feedback (dominado/a rever)  
- [x] Notificação diária  
- [x] Progresso e streaks  
- [x] UI simples e responsiva  

---

## Demonstração de funcionamento

https://youtu.be/Kuk_ix5SrMw

---

## Autor

- Pedro Pires  
- Projeto desenvolvido no âmbito da Disciplina Tópicos Avançados de Computação, Proposta 6 – AI FlashCards
