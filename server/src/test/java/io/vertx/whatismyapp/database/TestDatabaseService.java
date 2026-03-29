package io.vertx.whatismyapp.database;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.whatismyapp.database.DatabaseService;
import io.vertx.whatismyapp.database.DatabaseVerticle;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.concurrent.TimeUnit;

@ExtendWith(VertxExtension.class)
public class TestDatabaseService {
  private DatabaseService service;

  @BeforeEach
  void prepare(Vertx vertx, VertxTestContext testContext) {

  }



  @AfterEach
  public void finish(Vertx vertx, VertxTestContext testContext) {

  }

}
