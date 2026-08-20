import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'xcwcecfveyoavqfktsua';

const migrationFiles = [
  '20260820120000_schema.sql',
  '20260820120100_rls_policies.sql',
  '20260820120200_storage.sql'
];

async function runQuery(sql, name) {
  if (!TOKEN) {
    throw new Error("SUPABASE_ACCESS_TOKEN manquant dans l'environnement.");
  }
  console.log(`Application de ${name}...`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur ${res.status} sur ${name}: ${text}`);
  }

  console.log(`✓ ${name} appliquée avec succès !`);
}

async function main() {
  for (const filename of migrationFiles) {
    const filePath = path.join(__dirname, '..', 'migrations', filename);
    const sql = fs.readFileSync(filePath, 'utf-8');
    await runQuery(sql, filename);
  }
  console.log('\n🎉 Toutes les migrations Supabase ont été appliquées avec succès !');
}

main().catch(err => {
  console.error('Erreur :', err.message);
  process.exit(1);
});
