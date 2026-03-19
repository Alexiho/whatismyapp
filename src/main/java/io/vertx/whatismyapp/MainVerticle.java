package io.vertx.whatismyapp;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.whatismyapp.database.DatabaseVerticle;

public class MainVerticle extends AbstractVerticle {

  @Override
  public void start(Promise<Void> startPromise) {
    Future<String> dbVerticleDeployment = vertx.deployVerticle(new DatabaseVerticle());
    dbVerticleDeployment.compose(id ->
      vertx.deployVerticle("io.vertx.whatismyapp.http.HttpServerVerticle", new DeploymentOptions().setInstances(2)))
      .onComplete(ar -> {
        if (ar.succeeded()) {
          startPromise.complete();
        } else {
          startPromise.fail(ar.cause());
        }
      });
  }
}
