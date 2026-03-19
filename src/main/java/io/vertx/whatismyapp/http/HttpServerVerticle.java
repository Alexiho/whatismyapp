package io.vertx.whatismyapp.http;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServer;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.templ.freemarker.FreeMarkerTemplateEngine;
import io.vertx.whatismyapp.database.DatabaseService;
import io.vertx.whatismyapp.database.DatabaseVerticle;

public class HttpServerVerticle extends AbstractVerticle {

  private static final Logger LOGGER = LoggerFactory.getLogger(HttpServerVerticle.class);
  public static final String CONFIG_HTTP_SERVER_PORT = "http.server.port";
  private FreeMarkerTemplateEngine templateEngine;
  private DatabaseService dbService;

  @Override
  public void start(Promise<Void> startPromise) throws Exception {
    templateEngine = FreeMarkerTemplateEngine.create(vertx);
    String DbQueue = DatabaseVerticle.CONFIG_DB_QUEUE; //(1)
    dbService = DatabaseService.createProxy(vertx, DbQueue);
    HttpServer server = vertx.createHttpServer();
    Router router = Router.router(vertx);
    router.get("/").handler(this::indexHandler);
    router.get("/api/messages").handler(this::getLastMessagesHandler);
    router.post().handler(BodyHandler.create());
    router.post("/api/messages").handler(this::addMessageHandler);

    int portNumber = config().getInteger(CONFIG_HTTP_SERVER_PORT, 8080);

    server.requestHandler(router).listen(portNumber, ar -> {
      if (ar.succeeded()) {
        LOGGER.info("HTTP server running on port " + portNumber);
        startPromise.complete();
      } else {
        LOGGER.error("Could not start a HTTP server", ar.cause());
        startPromise.fail(ar.cause());
      }
    });
  }

  private void indexHandler(RoutingContext context) {
    dbService.fetchLastMessages(reply -> {
      if (reply.succeeded()) {
        context.put("messages", reply.result().getList());
        templateEngine.render(context.data(), "/templates/index.ftl", ar -> {
          if (ar.succeeded()) {
            context.response().putHeader("Content-Type", "text/html");
            context.response().end(ar.result());
          } else {
            context.fail(ar.cause());
          }
        });
      } else {
        context.fail(reply.cause());
      }
    });
  }

  private void getLastMessagesHandler(RoutingContext context) {
    dbService.fetchLastMessages(reply -> {
      if (reply.succeeded()) {
        context.put("messages", reply.result().getList());
        templateEngine.render(context.data(), "/templates/index.ftl", ar -> {
          if (ar.succeeded()) {
            context.response().putHeader("Content-Type", "text/html");
            context.response().end(ar.result());
          } else {
            context.fail(ar.cause());
          }
        });
      } else {
        context.fail(reply.cause());
      }
    });
  }

  private void addMessageHandler(RoutingContext context) {
    String author = context.request().getParam("author");
    String content = context.request().getParam("content");
    dbService.addMessage(author, content, reply -> {
      if (reply.succeeded()) {
        context.response().putHeader("Content-Type", "text/html");
        context.redirect("/");
      } else {
        context.fail(reply.cause());
      }
    });
  }
}
