# 🔄 Migration vers le Système d'ID Unifié

## 📋 Vue d'ensemble

Ce script migre la base de données PostgreSQL pour supporter le nouveau système d'ID unifié où tous les IDs sont de type `TEXT` au lieu de `INTEGER`.

## 🔧 Changements effectués

### 1. **Schéma de base de données**
- `bottles.id`: `SERIAL` → `TEXT PRIMARY KEY`
- `poops.id`: `SERIAL` → `TEXT PRIMARY KEY`

### 2. **API Routes**
- **POST /api/bottles**: Accepte maintenant `id` dans le body
- **POST /api/poops**: Accepte maintenant `id` dans le body
- **PUT/DELETE**: Utilisent déjà les IDs TEXT

### 3. **WebSocket**
- Compatible avec les IDs TEXT (pas de changement nécessaire)

## 🚀 Exécution de la migration

### Option 1: Script automatique
```bash
cd backend
npm run migrate
```

### Option 2: Manuel
```bash
cd backend
node migrate-unified-id.js
```

## ⚠️ Important

1. **Sauvegarde automatique**: Le script sauvegarde automatiquement les données existantes
2. **Nouveaux IDs**: Les données existantes reçoivent de nouveaux IDs au format `migrated_[type]_[old_id]_[timestamp]_[random]`
3. **Pas de retour en arrière**: Cette migration est irréversible

## 🔍 Vérification

Après la migration, vérifiez que :
- Les tables ont bien des colonnes `id TEXT PRIMARY KEY`
- Les API acceptent les IDs TEXT
- Le frontend peut synchroniser avec le backend

## 📝 Format des nouveaux IDs

- **Frontend**: `timestamp_random_deviceId` (ex: `1756851915350_whi8kwi0j_device_1756851915351_qkoddnshy`)
- **Migration**: `migrated_[type]_[old_id]_[timestamp]_[random]` (ex: `migrated_bottle_123_1756851915350_abc123def`)

## 🎯 Résultat attendu

- ✅ Synchronisation frontend/backend fonctionnelle
- ✅ IDs cohérents entre SQLite et PostgreSQL
- ✅ Pas de conflits d'IDs
- ✅ Synchronisation en arrière-plan fluide
