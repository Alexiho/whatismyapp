package io.vertx.whatismyapp.database;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(VertxExtension.class)
public class TestDatabaseService {

  private static DatabaseService dbService;

  @BeforeAll
  static void setup(Vertx vertx, VertxTestContext testContext) {
    // Création de la configuration JDBC pour HSQLDB
    JDBCClient client = JDBCClient.createShared(vertx, new io.vertx.core.json.JsonObject()
      .put("url", "jdbc:hsqldb:mem:testdb;shutdown=true")
      .put("driver_class", "org.hsqldb.jdbcDriver")
      .put("max_pool_size", 30)
    );

    // SQL de base pour le test
    HashMap<SqlQuery, String> sqlQueries = new HashMap<>();
    sqlQueries.put(SqlQuery.CREATE_MESSAGES_TABLE,
      "CREATE TABLE messages (id INTEGER IDENTITY PRIMARY KEY, author VARCHAR(255), content VARCHAR(255));");
    sqlQueries.put(SqlQuery.GET_LAST_MESSAGES,
      "SELECT * FROM messages ORDER BY id DESC;");
    sqlQueries.put(SqlQuery.GET_MESSAGE,
      "SELECT * FROM messages WHERE id = ?;");
    sqlQueries.put(SqlQuery.ADD_MESSAGE,
      "INSERT INTO messages (author, content) VALUES (?, ?);");
    sqlQueries.put(SqlQuery.DELETE_MESSAGE,
      "DELETE FROM messages WHERE id = ?;");
    sqlQueries.put(SqlQuery.PUT_MESSAGE,
      "UPDATE messages SET content = ?, id = ?, author = ? WHERE id = ?;");

    DatabaseService.create(client, sqlQueries, res -> {
      if (res.succeeded()) {
        dbService = res.result();
        testContext.completeNow();
      } else {
        testContext.failNow(res.cause());
      }
    });
  }

  @Test
  void testAddAndFetchMessage(VertxTestContext testContext) {
    dbService.addMessage("Alexis", "Hello world", addRes -> {
      assertTrue(addRes.succeeded());

      // Récupération des messages
      dbService.fetchLastMessages(fetchRes -> {
        assertTrue(fetchRes.succeeded());
        JsonArray messages = fetchRes.result();
        assertEquals(1, messages.size());

        JsonArray message = messages.getJsonArray(0);
        assertEquals("Alexis", message.getString(1));
        assertEquals("Hello world", message.getString(2));

        testContext.completeNow();
      });
    });
  }

  @Test
  void testFetchNonExistentMessage(VertxTestContext testContext) {
    dbService.fetchMessage("999", res -> {
      assertTrue(res.succeeded());
      JsonObject result = res.result();
      assertFalse(result.getBoolean("found"));
      testContext.completeNow();
    });
  }

  @Test
  void testDeleteMessage(VertxTestContext testContext) {
    // Ajouter d'abord un message
    dbService.addMessage("Bob", "To be deleted", addRes -> {
      assertTrue(addRes.succeeded());

      dbService.fetchLastMessages(fetchRes -> {
        assertTrue(fetchRes.succeeded());
        JsonArray messages = fetchRes.result();
        Integer id = messages.getJsonArray(0).getInteger(0);

        // Supprimer
        dbService.deleteMessage(id, deleteRes -> {
          assertTrue(deleteRes.succeeded());

          dbService.fetchMessage(String.valueOf(id), fetchDeletedRes -> {
            assertTrue(fetchDeletedRes.succeeded());
            assertFalse(fetchDeletedRes.result().getBoolean("found"));
            testContext.completeNow();
          });
        });
      });
    });
  }
}
