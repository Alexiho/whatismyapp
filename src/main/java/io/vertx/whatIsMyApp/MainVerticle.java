package io.vertx.whatIsMyApp;

import io.vertx.core.*;

public class MainVerticle extends AbstractVerticle {
  @Override
  public void start(Promise<Void> startPromise) {
    Future<String> dbVerticleDeployment = vertx.deployVerticle(new
      WikiDatabaseVerticle()); //(1)
    dbVerticleDeployment.compose(id ->
        vertx.deployVerticle("io.vertx.whatIsMyApp.HttpServerVerticle", //(2)
          new DeploymentOptions().setInstances(2))) //(3)
      .onComplete(ar -> { //(4)
        if (ar.succeeded()) {
          startPromise.complete();
        } else {
          startPromise.fail(ar.cause());
        }
      });
  }
}
