package io.vertx.whatismyapp.http;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServer;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.bridge.BridgeEventType;
import io.vertx.ext.bridge.PermittedOptions;

import io.vertx.ext.web.handler.sockjs.BridgeEvent;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSBridgeOptions;
import io.vertx.ext.web.templ.freemarker.FreeMarkerTemplateEngine;
import io.vertx.whatismyapp.database.DatabaseService;
import io.vertx.whatismyapp.database.DatabaseVerticle;

public class HttpServerVerticle extends AbstractVerticle {

  private static final Logger LOGGER = LoggerFactory.getLogger(HttpServerVerticle.class);
  public static final String CONFIG_HTTP_SERVER_PORT = "http.server.port";
  private FreeMarkerTemplateEngine templateEngine;
  private DatabaseService dbService;

  @Override
  public void start(Promise<Void> startPromise) {
    templateEngine = FreeMarkerTemplateEngine.create(vertx);
    String DbQueue = DatabaseVerticle.CONFIG_DB_QUEUE; //(1)
    dbService = DatabaseService.createProxy(vertx, DbQueue);
    Router router = Router.router(vertx);

    router.get("/").handler(this::indexHandler);
    router.get("/api/messages").handler(this::getLastMessagesHandler);
    router.get("/api/message/:id").handler(this::getMessageHandler);
    router.post().handler(BodyHandler.create());
    router.post("/api/messages").handler(this::addMessageHandler);

    SockJSBridgeOptions options = new SockJSBridgeOptions();
    options
      .addInboundPermitted(new PermittedOptions().setAddress("messages"))
      .addOutboundPermitted(new PermittedOptions().setAddressRegex(".*"));
    SockJSHandler sockJSHandler = SockJSHandler.create(vertx);

    // Mount the SockJS bridge as a handler on the /eventbus/* route. Use .handler(...) because
    // SockJSHandler.bridge(...) returns a Handler<RoutingContext>, not a Router.
    router
      .route("/eventbus/*")
      .subRouter(sockJSHandler.bridge(options, this::bridgeEventHandler));

    // Start the HTTP server and listen to upcoming requests
    int portNumber = config().getInteger(CONFIG_HTTP_SERVER_PORT, 8080);
    HttpServer server = vertx.createHttpServer();
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

  private void onSocketCreated(BridgeEvent event) {
    LOGGER.info("Socket created: " + event.socket().writeHandlerID());
    event.complete(true);
  }

  private void onSocketRegister(BridgeEvent event) {
    String address = event.getRawMessage().getString("address");
    if ("messages".equals(address)) {
      // Allow the registration first
      event.complete(true);
      LOGGER.info("Allowed REGISTER on 'messages' for socket " + event.socket().writeHandlerID());

      dbService.fetchLastMessages(reply -> {
        if (reply.succeeded()) {
          JsonObject published = new JsonObject()
            .put("kind", "last")
            .put("messages", reply.result());
          vertx.setTimer(20, id -> {
            vertx.eventBus().publish("messages", published);
            LOGGER.info("Last messages published to 'messages' address after REGISTER (socket: " + event.socket().writeHandlerID() + ")");
          });
        } else {
          LOGGER.error("Failed to fetch last messages for registering client", reply.cause());
        }
      });
      return;
    }
  }

  private void onSocketPublish(BridgeEvent event) {
    LOGGER.info("Received message from SockJS client: " + event.getRawMessage());
    // Traitement du message reçu de la part du client
    JsonObject rawMessage = event.getRawMessage().getJsonObject("body");
    String author = rawMessage.getString("author", "SockJSUser");
    String content = rawMessage.getString("content", rawMessage.encode());

    JsonObject payload = new JsonObject()
      .put("author", author)
      .put("content", content);
    dbService.addMessage(author, content, reply -> {
      if (reply.succeeded()) {
        LOGGER.info("Message added to the database successfully");
        // Création du message à publier pour tous les clients connectés
        JsonObject published = new JsonObject()
          .put("kind", "new")
          .put("message", payload);
        // Publication du message sur l'adresse client
        vertx.eventBus().publish("messages", published);
        LOGGER.info("Completing SEND/PUBLISH event as allowed (true)");
        event.complete(true);

      } else {
        LOGGER.error("Failed to add message to the database", reply.cause());
        LOGGER.info("Completing SEND/PUBLISH event as rejected (false)");
        // reject the original send so it won't be forwarded
        event.complete(false);
      }
    });
  }

  private void onSocketUpdate(BridgeEvent event) {
    LOGGER.info("Received update message from SockJS client: " + event.getRawMessage());
    // Traitement du message de mise à jour reçu de la part du client
    JsonObject rawMessage = event.getRawMessage().getJsonObject("body");
    String messageId = rawMessage.getString("id");
    String newContent = rawMessage.getString("content");

    // Log the update attempt
    LOGGER.info("Attempting to update message with ID: " + messageId + " to new content: " + newContent);
    event.complete(true); // Allow the update event to proceed for now, even though update handling is not implemented yet
  }

  private void onSocketDelete(BridgeEvent event) {
    LOGGER.info("Received update message from SockJS client: " + event.getRawMessage());
    // Traitement du message de mise à jour reçu de la part du client
    JsonObject rawMessage = event.getRawMessage().getJsonObject("body");
    String messageId = rawMessage.getString("id");
    String newContent = rawMessage.getString("content");

    // Log the update attempt
    LOGGER.info("Attempting to update message with ID: " + messageId + " to new content: " + newContent);
    event.complete(true); // Allow the update event to proceed for now, even though update handling is not implemented yet
  }

  private void bridgeEventHandler(BridgeEvent event) {
    LOGGER.info("Received SockJS bridge event: " + event.type() + " from socket: " + event.socket().writeHandlerID());
    // Log raw message for debugging
    LOGGER.info("Bridge raw message: " + event.getRawMessage());

    if (event.type() == BridgeEventType.SOCKET_CREATED) {
      onSocketCreated(event);
    }

    else if (event.type() == BridgeEventType.REGISTER) {
      onSocketRegister(event);
      return;
    }

    else if (event.type() == BridgeEventType.SEND || event.type() == BridgeEventType.PUBLISH) {
      JsonObject rawMessage = event.getRawMessage().getJsonObject("body");
      LOGGER.info("Handling SEND/PUBLISH event with raw message: " + rawMessage);
      if (rawMessage.getString("type").equals("rec")) onSocketPublish(event);
      else if (rawMessage.getString("type").equals("update")) onSocketUpdate(event);
      else if (rawMessage.getString("type").equals("delete")) LOGGER.info("Delete event received, but delete handling is not implemented yet.");
      return;
    }

    // By default allow the bridge event to proceed
    LOGGER.info("Default bridge event completion (true) for event: " + event.type());
    event.complete(true);
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
        // return JSON array of messages
        context.response().putHeader("Content-Type", "application/json");
        context.response().end(reply.result().encode());
      } else {
        context.fail(reply.cause());
      }
    });
  }

  private void getMessageHandler(RoutingContext context) {
    String requestedMessageId = context.request().getParam("id");
    dbService.fetchMessage(requestedMessageId, reply -> {
      if (reply.succeeded()) {
        context.put("message", reply.result().getValue("message", new JsonArray()));
        templateEngine.render(context.data(), "/templates/message.ftl", ar -> {
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
