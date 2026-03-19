package io.vertx.whatismyapp;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.whatismyapp.database.DatabaseService;
import io.vertx.whatismyapp.database.DatabaseVerticle;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(VertxExtension.class)
public class DatabaseServiceTest {
  private DatabaseService service;

  @BeforeEach
  void prepare(Vertx vertx, VertxTestContext testContext) {
    JsonObject conf = new JsonObject() //(1)
      .put(DatabaseVerticle.CONFIG_DB_JDBC_URL,
        "jdbc:hsqldb:mem:testdb;shutdown=true")
      .put(DatabaseVerticle.CONFIG_DB_JDBC_MAX_POOL_SIZE, 4);
    vertx.deployVerticle(new DatabaseVerticle(), new
        DeploymentOptions().setConfig(conf),
      testContext.succeeding(id -> { //(2)
        service = DatabaseService.createProxy(vertx,
          DatabaseVerticle.CONFIG_DB_QUEUE);
        testContext.completeNow();
      })
    );
  }
/*
  @Test
  void crud_operations(Vertx vertx, VertxTestContext testContext) throws Throwable {
    service.createPage("Test", "Some content", testContext.succeeding(v1 -> {
      service.fetchPage("Test", testContext.succeeding(json1 -> {
        Assertions.assertTrue(json1.getBoolean("found"));
        Assertions.assertTrue(json1.containsKey("id"));
        Assertions.assertEquals("Some content", json1.getString("rawContent"));
        service.savePage(json1.getInteger("id"), "Yo!", testContext.succeeding(v2 -> {
          service.fetchAllPages(testContext.succeeding(array1 -> {
            Assertions.assertEquals(1, array1.size());
            service.fetchPage("Test", testContext.succeeding(json2 -> {
              Assertions.assertEquals("Yo!", json2.getString("rawContent"));
              service.deletePage(json1.getInteger("id"), v3 -> {
                service.fetchAllPages(testContext.succeeding(array2 -> {
                  Assertions.assertTrue(array2.isEmpty());
                  testContext.completeNow(); //(1)
                }));
              });
            }));
          }));
        }));
      }));
    }));
    testContext.awaitCompletion(5000, TimeUnit.MILLISECONDS);
  }*/

  @AfterEach
  public void finish(Vertx vertx, VertxTestContext testContext) {
    vertx.close(testContext.succeedingThenComplete());
  }

}
