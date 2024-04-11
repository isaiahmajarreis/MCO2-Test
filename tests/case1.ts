import { PoolConnection } from "mysql2/promise";
import { synchronizer_utils } from "../model/synchronizer"; 

async function testFetchAppointment(
  mainConnection: PoolConnection,
  shardConnection: PoolConnection,
  mainConnection2: PoolConnection,
  isolationLevel: string,
  appointmentId: number
): Promise<void> {
  const results = await Promise.all([
    mainConnection.query("SELECT * FROM appointments WHERE apptid = ?", [appointmentId]),
    shardConnection.query("SELECT * FROM appointments WHERE apptid = ?", [appointmentId]),
  ]);

  // Expect both transactions to be successful and return the same appointment
  expect(results[0][0]).toMatchObject(results[1][0]);
}

describe("Case #1: Concurrent transactions in two or more nodes are reading the same data item", () => {
  test("Repeatable Read", async () => {
    await testFetchAppointment(mainConnection, shardConnection, mainConnection2, "REPEATABLE READ", appointmentId);
  });

});