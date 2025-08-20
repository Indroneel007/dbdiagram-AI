// utils/extractTables.ts

export interface Column {
  name: string;
}

export interface CreateTableStatement {
  type: "create table";
  name: { name: string };
  columns: { name: { name: string } }[];
}

export type SQLStatement = CreateTableStatement; // extend if you add more types later

export interface Table {
  id: string;
  name: string;
  columns: string[];
}

export interface Relation {
  id: string;
  sourceTable: string; // child table
  sourceColumn: string; // fk column in child
  targetTable: string; // referenced table
  targetColumn: string; // referenced column in parent
}

export function extractTables(ast: SQLStatement[]): Table[] {
  const tables: Table[] = [];

  ast.forEach((stmt, index) => {
    if (stmt.type === "create table") {
      const tableName = stmt.name.name;
      const columns = stmt.columns.map((c) => c.name.name);
      tables.push({
        id: `table-${index}`,
        name: tableName,
        columns,
      });
    }
  });

  return tables;
}

// Very lightweight SQL parser for FK/PK using regex. Works with common patterns like:
// - id serial primary key
// - foreign key (user_id) references users(id)
// - user_id int references users(id)
export function extractSchemaFromSQL(sql: string): { tables: Table[]; relations: Relation[] } {
  const tables: Table[] = [];
  const relations: Relation[] = [];

  // Normalize whitespace and split into lines for block parsing
  const lines = sql.replace(/\r\n?/g, "\n").split(/\n/);

  let currentTable: string | null = null;
  let currentColumns: string[] = [];
  let blockBuf: string[] = [];
  let tableIndex = 0; // kept for legacy, but we will prefer stable ids based on name

  const startTableRe = /^\s*create\s+table\s+"?([a-zA-Z_][\w]*)"?\s*\(/i;
  // End of table only when the line is just ")" (optionally followed by ;) and nothing else,
  // so we don't mistakenly close on column type parentheses like VARCHAR(100)
  const endTableRe = /^\s*\)\s*;?\s*$/;
  const columnNameRe = /^\s*"?([a-zA-Z_][\w]*)"?\s+/;
  const inlinePkRe = /primary\s+key/i;
  const fkConstraintRe = /foreign\s+key\s*\(\s*"?([a-zA-Z_][\w]*)"?\s*\)\s+references\s+"?([a-zA-Z_][\w]*)"?\s*\(\s*"?([a-zA-Z_][\w]*)"?\s*\)/i;
  const inlineRefRe = /\sreferences\s+"?([a-zA-Z_][\w]*)"?\s*\(\s*"?([a-zA-Z_][\w]*)"?\s*\)/i;

  // helper to get or create a table by name
  const stableId = (name: string) => `table-${name}`;
  const getOrCreateTable = (name: string): Table => {
    let t = tables.find((x) => x.name === name);
    if (!t) {
      t = { id: stableId(name), name, columns: [] };
      tables.push(t);
    }
    return t;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // start table
    const startMatch = line.match(startTableRe);
    if (startMatch) {
      currentTable = startMatch[1];
      currentColumns = [];
      blockBuf = [];
      continue;
    }

    if (currentTable) {
      // collect lines into block buffer until we hit endTableRe
      if (!endTableRe.test(line)) {
        blockBuf.push(line);
        continue;
      }

      // We reached the end of the CREATE TABLE block: parse accumulated block
      const block = blockBuf.join("\n");

      // Split column/constraint definitions by top-level commas (not inside parentheses)
      const defs: string[] = [];
      let depth = 0;
      let start = 0;
      for (let i = 0; i < block.length; i++) {
        const ch = block[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth = Math.max(0, depth - 1);
        else if (ch === ',' && depth === 0) {
          defs.push(block.slice(start, i));
          start = i + 1;
        }
      }
      // push last segment
      const lastSeg = block.slice(start);
      if (lastSeg.trim().length) defs.push(lastSeg);

      // keywords to ignore as column names
      const ignoreFirst = new Set(['primary', 'foreign', 'constraint', 'unique', 'check']);

      for (const rawDef of defs) {
        const def = rawDef.trim();
        if (!def) continue;

        // column name = first identifier in the def
        const m = def.match(/^"?([a-zA-Z_][\w]*)"?/);
        if (m) {
          const first = m[1];
          if (!ignoreFirst.has(first.toLowerCase())) {
            if (!currentColumns.includes(first)) currentColumns.push(first);

            // inline references in the same definition
            const inline = def.match(inlineRefRe);
            if (inline) {
              const [, refTable, refCol] = inline;
              relations.push({
                id: `rel-${relations.length}`,
                sourceTable: currentTable,
                sourceColumn: first,
                targetTable: refTable,
                targetColumn: refCol,
              });
              const parent = getOrCreateTable(refTable);
              if (!parent.columns.includes(refCol)) parent.columns.push(refCol);
            }
          }
        }
      }

      // Also scan block for separate FK constraints: foreign key (col) references table(col)
      const fkGlobal = new RegExp(fkConstraintRe.source, 'ig');
      let match: RegExpExecArray | null;
      while ((match = fkGlobal.exec(block)) !== null) {
        const [, fkCol, refTable, refCol] = match;
        relations.push({
          id: `rel-${relations.length}`,
          sourceTable: currentTable,
          sourceColumn: fkCol,
          targetTable: refTable,
          targetColumn: refCol,
        });
        const parent = getOrCreateTable(refTable);
        if (!parent.columns.includes(refCol)) parent.columns.push(refCol);
      }

      // finalize current table: merge with stub if exists, else create
      const existing = tables.find((t) => t.name === currentTable);
      if (existing) {
        for (const c of currentColumns) if (!existing.columns.includes(c)) existing.columns.push(c);
      } else {
        tables.push({ id: stableId(currentTable), name: currentTable, columns: currentColumns.slice() });
      }
      currentTable = null;
      currentColumns = [];
      blockBuf = [];
      continue;
    }
  }

  return { tables, relations };
}
