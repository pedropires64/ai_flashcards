// db.js — SQLite (API sync) + tags + imagens + stats + streak + lembretes + logs + export/import
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('flashcards.db');

// helpers
const run = (sql, params = []) => db.runSync(sql, params);
const all = (sql, params = []) => db.getAllSync(sql, params);
const get = (sql, params = []) => (db.getAllSync(sql, params)?.[0] ?? null);

export const initDB = () => {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      mastered INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS study_log (
      day TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    );
  `);

  // migrações simples (ignorar erro se já existir)
  try { run(`ALTER TABLE cards ADD COLUMN tags TEXT`); } catch {}
  try { run(`ALTER TABLE cards ADD COLUMN image_uri TEXT`); } catch {}

  // defaults meta
  if (!get(`SELECT value FROM meta WHERE key='streak'`)) run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('streak','0')`);
  if (!get(`SELECT value FROM meta WHERE key='last_study_date'`)) run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('last_study_date','')`);
  if (!get(`SELECT value FROM meta WHERE key='reminder_enabled'`)) run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('reminder_enabled','1')`);
  if (!get(`SELECT value FROM meta WHERE key='reminder_hour'`)) run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('reminder_hour','20')`);
  if (!get(`SELECT value FROM meta WHERE key='reminder_minute'`)) run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('reminder_minute','0')`);
};

// ---------- utils datas
const pad = (n) => String(n).padStart(2, '0');
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
};
const addDays = (dateStr, days) => {
  const [y,m,d] = (dateStr || '1970-01-01').split('-').map(Number);
  const dt = new Date(y, m-1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
};

// ---------- collections
export const getCollections = () => all(`SELECT * FROM collections ORDER BY id DESC`);
export const createCollection = (name) => run(`INSERT INTO collections (name) VALUES (?)`, [name.trim()]);
export const deleteCollection = (id) => {
  run(`DELETE FROM cards WHERE collection_id = ?`, [id]);
  run(`DELETE FROM collections WHERE id = ?`, [id]);
};

// ---------- cards (com tags/imagem)
const normTags = (txt) =>
  (txt || '')
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)
    .join(',');

export const getCardsByCollection = (collectionId) =>
  all(`SELECT * FROM cards WHERE collection_id = ? ORDER BY id DESC`, [collectionId]);

export const createCard = (collectionId, front, back, tags = '', imageUri = null) =>
  run(`INSERT INTO cards (collection_id, front, back, tags, image_uri) VALUES (?, ?, ?, ?, ?)`,
      [collectionId, front.trim(), back.trim(), normTags(tags), imageUri]);

export const updateCard = (id, fields = {}) => {
  const set = [];
  const params = [];
  for (const [k, v] of Object.entries(fields)) {
    if (k === 'tags') { set.push(`tags = ?`); params.push(normTags(v)); }
    else if (k === 'image_uri') { set.push(`image_uri = ?`); params.push(v); }
    else { set.push(`${k} = ?`); params.push(v); }
  }
  if (!set.length) return;
  params.push(id);
  run(`UPDATE cards SET ${set.join(', ')} WHERE id = ?`, params);
};

export const setCardMastered = (id, mastered) =>
  run(`UPDATE cards SET mastered = ? WHERE id = ?`, [mastered ? 1 : 0, id]);

export const deleteCard = (id) => run(`DELETE FROM cards WHERE id = ?`, [id]);

// pesquisa/filtragem
export const searchCards = ({ collectionId, query = '', tagList = [], onlyNotMastered = false, order = 'newest' }) => {
  let sql = `SELECT * FROM cards WHERE collection_id = ?`;
  const params = [collectionId];

  if (onlyNotMastered) sql += ` AND mastered = 0`;

  if (query?.trim()) {
    sql += ` AND (front LIKE ? OR back LIKE ?)`;
    params.push(`%${query}%`, `%${query}%`);
  }

  for (const t of tagList) {
    sql += ` AND (','||LOWER(IFNULL(tags,''))||',' LIKE ?)`;
    params.push(`%,${t.toLowerCase()},%`);
  }

  if (order === 'alphabetical') sql += ` ORDER BY front COLLATE NOCASE ASC`;
  else if (order === 'oldest') sql += ` ORDER BY id ASC`;
  else sql += ` ORDER BY id DESC`;

  return all(sql, params);
};

// IMPORT bulk
export const bulkCreateCards = (collectionId, pairs) => {
  db.execSync('BEGIN');
  for (const { front, back, tags = '', image_uri = null } of pairs) {
    if (!front?.trim() || !back?.trim()) continue;
    db.runSync(
      'INSERT INTO cards (collection_id, front, back, tags, image_uri) VALUES (?, ?, ?, ?, ?)',
      [collectionId, front.trim(), back.trim(), normTags(tags), image_uri]
    );
  }
  db.execSync('COMMIT');
};

// stats
export const getCollectionStats = (collectionId) => {
  const total = get(`SELECT COUNT(*) c FROM cards WHERE collection_id = ?`, [collectionId])?.c ?? 0;
  const mastered = get(`SELECT COUNT(*) c FROM cards WHERE collection_id = ? AND mastered = 1`, [collectionId])?.c ?? 0;
  const percent = total ? Math.round((mastered/total)*100) : 0;
  return { total, mastered, percent };
};
export const getAllCollectionsWithStats = () => getCollections().map(c => ({ ...c, ...getCollectionStats(c.id) }));

// streak + log
export const getStreak = () => parseInt(get(`SELECT value FROM meta WHERE key='streak'`)?.value ?? '0', 10) || 0;
export const getLastStudyDate = () => get(`SELECT value FROM meta WHERE key='last_study_date'`)?.value ?? '';

export const registerStudyActivity = () => {
  const today = todayLocal();
  const last = getLastStudyDate();
  let streak = getStreak();
  if (last === today) { /* nada */ }
  else if (last && addDays(last, 1) === today) streak += 1;
  else streak = 1;

  run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('streak',?)`, [String(streak)]);
  run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('last_study_date',?)`, [today]);

  const row = get(`SELECT count FROM study_log WHERE day = ?`, [today]);
  if (row) run(`UPDATE study_log SET count = count + 1 WHERE day = ?`, [today]);
  else run(`INSERT INTO study_log (day,count) VALUES (?,?)`, [today, 1]);
};

export const getStudyLogLastNDays = (n = 14) => {
  const days = [];
  for (let i = n-1; i >= 0; i--) {
    const d = addDays(todayLocal(), -i);
    days.push({ day: d, count: get(`SELECT count FROM study_log WHERE day = ?`, [d])?.count ?? 0 });
  }
  return days;
};

// lembretes
export const getReminderSettings = () => {
  const enabled = get(`SELECT value FROM meta WHERE key='reminder_enabled'`)?.value === '1';
  const hour = parseInt(get(`SELECT value FROM meta WHERE key='reminder_hour'`)?.value ?? '20', 10);
  const minute = parseInt(get(`SELECT value FROM meta WHERE key='reminder_minute'`)?.value ?? '0', 10);
  return { enabled, hour, minute };
};
export const setReminderSettings = ({ enabled, hour, minute }) => {
  run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('reminder_enabled',?)`, [enabled ? '1' : '0']);
  run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('reminder_hour',?)`, [String(hour)]);
  run(`INSERT OR REPLACE INTO meta (key,value) VALUES ('reminder_minute',?)`, [String(minute)]);
};

// export/import JSON
export const getCollectionWithCards = (collectionId) => {
  const collection = get(`SELECT * FROM collections WHERE id = ?`, [collectionId]);
  const cards = all(`SELECT * FROM cards WHERE collection_id = ? ORDER BY id`, [collectionId]);
  return { collection, cards, version: 1 };
};

export const importCardsFromJson = (collectionId, jsonObj) => {
  const arr = (jsonObj?.cards ?? []).map(c => ({
    front: c.front, back: c.back, tags: c.tags ?? '', image_uri: c.image_uri ?? null
  }));
  bulkCreateCards(collectionId, arr);
};