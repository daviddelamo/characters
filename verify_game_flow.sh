#!/bin/bash
set -e

BASE_URL="http://localhost:3000"

echo "1. Creating new game..."
GAME_RES=$(curl -s -X POST "$BASE_URL/api/games")
GAME_ID=$(echo $GAME_RES | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Game ID: $GAME_ID"

if [ -z "$GAME_ID" ]; then
    echo "Failed to create game"
    exit 1
fi

echo "2. Fetching candidates..."
CANDIDATES=$(curl -s "$BASE_URL/api/games/$GAME_ID/candidates")
COUNT_1=$(echo $CANDIDATES | grep -o '"id":' | wc -l)
echo "Initial candidates count: $COUNT_1"

if [ "$COUNT_1" -eq "0" ]; then
    echo "No candidates found (check if DB has characters). Skipping rest."
    exit 0
fi

# Pick first char ID
FIRST_CHAR_ID=$(echo $CANDIDATES | grep -o '"id":"[^"]*"' | head -n 1 | cut -d'"' -f4)
echo "Picking character ID: $FIRST_CHAR_ID"

echo "3. Marking as played..."
curl -s -X POST -H "Content-Type: application/json" -d "{\"characterId\": \"$FIRST_CHAR_ID\"}" "$BASE_URL/api/games/$GAME_ID/played"

echo "4. Checking if character ID $FIRST_CHAR_ID is present in new candidates..."
CANDIDATES_2=$(curl -s "$BASE_URL/api/games/$GAME_ID/candidates")

if echo "$CANDIDATES_2" | grep -q "\"$FIRST_CHAR_ID\""; then
    echo "FAILURE: Character $FIRST_CHAR_ID is STILL present in candidates list!"
    exit 1
else
    echo "SUCCESS: Character $FIRST_CHAR_ID is NO LONGER in candidates list."
    exit 0
fi
