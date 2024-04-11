import { PoolConnection } from "mysql2/promise";
import { testFetchAppointment } from "case1"; 
import { mock, when } from "ts-mockito";

describe("testFetchAppointment", () => {
  test("should return the same appointment for concurrent transactions", async () => {
    // Mock PoolConnection objects
    const mainConnectionMock = mock<PoolConnection>();
    const shardConnectionMock = mock<PoolConnection>();
    const mainConnection2Mock = mock<PoolConnection>();

    // Mock query results
    const appointmentId = 123; 
    const appointmentData = { };
    const queryResult = [[appointmentData], [appointmentData]]; 

    
    when(mainConnectionMock.query("SELECT * FROM appointments WHERE apptid = ?", [appointmentId]))
      .thenResolve(queryResult);
    when(shardConnectionMock.query("SELECT * FROM appointments WHERE apptid = ?", [appointmentId]))
      .thenResolve(queryResult);

    
    await testFetchAppointment(
      mainConnectionMock,
      shardConnectionMock,
      mainConnection2Mock,
      "REPEATABLE READ", 
      appointmentId
    );


  });
});
