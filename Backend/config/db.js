
import dotenv from "dotenv"

import pkg from "pg";

const { Pool } = pkg;
dotenv.config();
const pool = new Pool({

  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});


async function ConnecToDb() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT version()");
    console.log("DataBase is Connected");
    console.log(result.rows[0].version);
    client.release();
  } catch (error) {
    console.log(error);
  }
}
ConnecToDb();


export default pool;