# Contrat de paris TON – Dame Hot Game

## Fichier

- `betting.fc` : contrat FunC (storage paris, dépôt, résolution, getters).

## Storage

- `ctx_bet_id` : prochain id de pari (uint32).
- `ctx_total_pool` : total des mises en nanoTON (coins).
- `ctx_bets_dict` : dictionnaire `bet_id -> value` (slice).

Structure d’une entrée bet (value) :

- `player_address` : slice (MsgAddress).
- `amount` : coins (nanoTON).
- `status` : 2 bits (0 = pending, 1 = won, 2 = lost).
- `game_id` : ref (cell contenant un slice = game_id).

## Opérations (recv_internal)

### 1. Placer un pari (op = 1)

- **Corps du message (slice) :**
  - `op` : 32 bits = `1`
  - `game_id` : 1 ref = cell contenant un slice (ex. game_id en bytes/UTF-8).

- **Valeur du message :** montant du pari en TON (sera en nanoTON dans `msg_value`).

- Effet : crée une entrée bet avec `status = 0`, incrémente `ctx_bet_id`, ajoute `msg_value` au pool.

### 2. Résoudre un pari (op = 2)

- **Corps du message :**
  - `op` : 32 bits = `2`
  - `bet_id` : 32 bits
  - `result` : 1 bit (`1` = gagné, `0` = perdu).

- **À faire côté contrat :** restreindre à un admin (ex. vérifier `sender_address == admin_address`).

- Effet :
  - Si `result == 1` : envoi de `amount * 19 / 10` (1.9x, 10 % de commission) au joueur, mise à jour du bet en `status = 1`, mise à jour du pool.
  - Si `result == 0` : mise à jour du bet en `status = 2` uniquement.

## Get methods

- `get_bet_id()` : retourne `ctx_bet_id`.
- `get_total_pool()` : retourne `ctx_total_pool` (nanoTON).
- `get_bet(bet_id)` : retourne `(player_slice, amount, status)` ou `(empty_slice, 0, -1)` si non trouvé.

## Build (exemple)

Avec [Blueprint](https://github.com/ton-org/blueprint) ou [toncli](https://github.com/ton-org/toncli) :

- Inclure `stdlib.fc` (TON stdlib).
- Compiler `betting.fc` → `.boc` / `.tvc` et déployer.

## Frontend (ton.ts)

Pour **placeBet**, le payload de la transaction doit être un **BOC** dont la cellule racine est :

1. `store_uint(1, 32)`  → op = 1  
2. `store_ref(cell_game_id)`  → ref vers une cell dont le slice contient le game_id (ex. bytes du string).

La valeur du message = montant du pari en TON (le wallet envoie en nanoTON).

Pour **resolveBet** (admin), payload :

1. `store_uint(2, 32)`  → op = 2  
2. `store_uint(bet_id, 32)`  
3. `store_uint(result, 1)`  → 1 = won, 0 = lost  

Utiliser une lib (ex. `@ton/core`) pour construire les cells et générer le BOC si besoin.
