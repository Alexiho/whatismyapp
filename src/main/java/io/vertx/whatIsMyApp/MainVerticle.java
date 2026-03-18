<<<<<<< HEAD
package io.vertx.vertx_wiki;

import io.vertx.core.*;

public class MainVerticle extends AbstractVerticle {
  @Override
  public void start(Promise<Void> startPromise) {
    Future<String> dbVerticleDeployment = vertx.deployVerticle(new
      WikiDatabaseVerticle()); //(1)
    dbVerticleDeployment.compose(id ->
        vertx.deployVerticle("io.vertx.vertx_wiki.HttpServerVerticle", //(2)
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


=======
package io.vertx.whatIsMyApp;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;

public class MainVerticle extends AbstractVerticle {

  @Override
  public void start(Promise<Void> startPromise) throws Exception {
    vertx.createHttpServer().requestHandler(req -> {
      req.response()
        .putHeader("content-type", "text/plain")
        .end("Hello from Vert.x!");
    }).listen(8888).onComplete(http -> {
      if (http.succeeded()) {
        startPromise.complete();
        System.out.println("HTTP server started on port 8888");
      } else {
        startPromise.fail(http.cause());
      }
    });
  }
}
>>>>>>> 5871ce0544c2119238a71d6c0522d77a0d3626f1
