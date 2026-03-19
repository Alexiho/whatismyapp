package io.vertx.whatismyapp.database;

import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.SQLConnection;

import java.util.HashMap;

public class DatabaseServiceImpl implements DatabaseService {
  private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseServiceImpl.class);
  private final HashMap<SqlQuery, String> sqlQueries;
  private final JDBCClient dbClient;
  public DatabaseServiceImpl(JDBCClient dbClient, HashMap<SqlQuery, String> sqlQueries, Handler<AsyncResult<DatabaseService>> readyHandler) {
    this.dbClient = dbClient;
    this.sqlQueries = sqlQueries;
    dbClient.getConnection(ar -> {
      if (ar.failed()) {
        LOGGER.error("Could not open a database connection", ar.cause());
        readyHandler.handle(Future.failedFuture(ar.cause()));
      } else {
        SQLConnection connection = ar.result();
        connection.execute(sqlQueries.get(SqlQuery.CREATE_MESSAGES_TABLE), create -> {
          connection.close();
          if (create.failed()) {
            LOGGER.error("Database preparation error", create.cause());
            readyHandler.handle(Future.failedFuture(create.cause()));
          } else {
            readyHandler.handle(Future.succeededFuture(this));
          }
        });
      }
    });
  }
  @Override
  public DatabaseService fetchLastMessages(Handler<AsyncResult<JsonArray>>
                                             resultHandler) {
    dbClient.query(sqlQueries.get(SqlQuery.GET_LAST_MESSAGES), res -> {
      if (res.succeeded()) {
        JsonArray messages = new JsonArray(res.result()
          .getResults());
        resultHandler.handle(Future.succeededFuture(messages));
      } else {
        LOGGER.error("Database query error", res.cause());
        resultHandler.handle(Future.failedFuture(res.cause()));
      }
    });
    return this;
  }

  @Override
  public DatabaseService addMessage(String author, String content, Handler<AsyncResult<Void>> resultHandler) {
    JsonArray data = new JsonArray().add(author).add(content);
    dbClient.updateWithParams(sqlQueries.get(SqlQuery.ADD_MESSAGE), data, res -> {
      if (res.succeeded()) {
        resultHandler.handle(Future.succeededFuture());
      } else {
        LOGGER.error("Database query error", res.cause());
        resultHandler.handle(Future.failedFuture(res.cause()));
      }
    });
    return this;
  }
}
