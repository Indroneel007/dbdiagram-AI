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
