package io.vertx.whatismyapp.database;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.serviceproxy.ProxyHelper;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Properties;

public class DatabaseVerticle extends AbstractVerticle {
  public static final String CONFIG_DB_JDBC_URL = "db.jdbc.url";
  public static final String CONFIG_DB_JDBC_DRIVER_CLASS = "db.jdbc.driver_class";
  public static final String CONFIG_DB_JDBC_MAX_POOL_SIZE = "db.jdbc.max_pool_size";
  public static final String CONFIG_DB_SQL_QUERIES_RESOURCE_FILE = "db.sqlqueries.resource.file";
  public static final String CONFIG_DB_QUEUE = "db.queue";
  /*
   * Note : ceci realise un appel à une API bloquante, mais il n'y a pas beaucoup de données à récupérer...
   */
  private HashMap<SqlQuery, String> loadSqlQueries() throws IOException {
    String queriesFile = config().getString(CONFIG_DB_SQL_QUERIES_RESOURCE_FILE); //(1)
    InputStream queriesInputStream;
    if (queriesFile != null) {
      queriesInputStream = new FileInputStream(queriesFile);
    } else {
      queriesInputStream = getClass().getResourceAsStream("/db-queries.properties");
    }
    Properties queriesProps = new Properties();
    queriesProps.load(queriesInputStream);
    queriesInputStream.close();
    HashMap<SqlQuery, String> sqlQueries = new HashMap<>();
    sqlQueries.put(SqlQuery.CREATE_MESSAGES_TABLE, queriesProps.getProperty("create-messages-table"));
    sqlQueries.put(SqlQuery.GET_LAST_MESSAGES, queriesProps.getProperty("get-last-messages"));
    sqlQueries.put(SqlQuery.GET_MESSAGE, queriesProps.getProperty("get-message"));
    sqlQueries.put(SqlQuery.ADD_MESSAGE, queriesProps.getProperty("add-message"));
    return sqlQueries;
  }
  @Override
  public void start(Promise<Void> startPromise) throws Exception {
    HashMap<SqlQuery, String> sqlQueries = loadSqlQueries();
    JDBCClient dbClient = JDBCClient.createShared(vertx, new JsonObject()
      .put("url", config().getValue(CONFIG_DB_JDBC_URL,"jdbc:hsqldb:file:db/whatismyapp"))
      .put("driver_class", config().getValue(CONFIG_DB_JDBC_DRIVER_CLASS,"org.hsqldb.jdbcDriver"))
      .put("max_pool_size", config().getValue(CONFIG_DB_JDBC_MAX_POOL_SIZE,30)));
    DatabaseService.create(dbClient, sqlQueries, ready -> {
      if (ready.succeeded()) {
        ProxyHelper.registerService(DatabaseService.class, vertx, ready.result(),
          CONFIG_DB_QUEUE);
        startPromise.complete();
      } else {
        startPromise.fail(ready.cause());
      }
    });
  }
}
