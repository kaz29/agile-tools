'use client';

import { useEffect, useState } from 'react';
import { PGlite } from '@electric-sql/pglite';

let dbInstance: PGlite | null = null;

async function getDB(): Promise<PGlite> {
  if (!dbInstance) {
    dbInstance = new PGlite('idb://planning-poker');
    await initSchema(dbInstance);
  }
  return dbInstance;
}

async function initSchema(db: PGlite) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      story TEXT,
      my_vote TEXT,
      final_estimate TEXT,
      participants INTEGER,
      voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export function usePGLite() {
  const [db, setDb] = useState<PGlite | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getDB().then((instance) => {
      setDb(instance);
      setIsReady(true);
    });
  }, []);

  return { db, isReady };
}

// クエリヘルパー
export async function saveVote(db: PGlite, vote: {
  sessionId: string;
  story: string;
  myVote: string;
  finalEstimate: string;
  participants: number;
}) {
  const id = crypto.randomUUID();
  await db.query(
    `INSERT INTO votes (id, session_id, story, my_vote, final_estimate, participants)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, vote.sessionId, vote.story, vote.myVote, vote.finalEstimate, vote.participants]
  );
  return id;
}

export async function getVoteHistory(db: PGlite, limit = 50) {
  const result = await db.query<{
    id: string;
    story: string;
    my_vote: string;
    final_estimate: string;
    participants: number;
    voted_at: string;
  }>(
    `SELECT * FROM votes ORDER BY voted_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function getUserSetting(db: PGlite, key: string): Promise<string | null> {
  const result = await db.query<{ value: string }>(
    `SELECT value FROM user_settings WHERE key = $1`,
    [key]
  );
  return result.rows[0]?.value ?? null;
}

export async function setUserSetting(db: PGlite, key: string, value: string) {
  await db.query(
    `INSERT INTO user_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, value]
  );
}
