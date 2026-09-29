const Database = require("better-sqlite3");
const db = new Database("data/simas.db");
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all();
for (const t of tables) {
  let count = "n/a";
  try {
    count = db.prepare("SELECT COUNT(*) c FROM " + t.name).get().c;
  } catch (e) {
    count = "err";
  }
  console.log(t.name.padEnd(28) + count);
}
db.close();
