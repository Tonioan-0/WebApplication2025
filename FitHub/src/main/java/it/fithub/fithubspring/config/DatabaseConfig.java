package it.fithub.fithubspring.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    private static class DataSourceHolder {
        private static volatile SingletonDataSource instance;
    }

    @PostConstruct
    public void validateConfiguration() {
        if (url == null || url.trim().isEmpty()) {
            printRedError("ERRORE: La variabile di ambiente 'spring.datasource.url' non è configurata!");
            throw new IllegalStateException("Database URL non configurato");
        }
        if (username == null || username.trim().isEmpty()) {
            printRedError("ERRORE: La variabile di ambiente 'spring.datasource.username' non è configurata!");
            throw new IllegalStateException("Database username non configurato");
        }
        if (password == null) {
            printRedError("ERRORE: La variabile di ambiente 'DB_PASSWORD' non è configurata!");
            throw new IllegalStateException("Database password non configurata");
        }
        System.out.println("✓ Configurazione database validata correttamente");
    }

    @Bean
    public DataSource dataSource() {
        if (DataSourceHolder.instance == null) {
            synchronized (DataSourceHolder.class) {
                if (DataSourceHolder.instance == null) {
                    DataSourceHolder.instance = new SingletonDataSource(url, username, password);
                }
            }
        }
        return DataSourceHolder.instance;
    }

    private static class SingletonDataSource implements DataSource {
        private final String url;
        private final String username;
        private final String password;

        private SingletonDataSource(String url, String username, String password) {
            this.url = url;
            this.username = username;
            this.password = password;
        }

        @Override
        public Connection getConnection() throws SQLException {
            return DriverManager.getConnection(url, username, password);
        }

        @Override
        public Connection getConnection(String username, String password) throws SQLException {
            return DriverManager.getConnection(url, username, password);
        }

        @Override
        public java.io.PrintWriter getLogWriter() {
            return null;
        }

        @Override
        public void setLogWriter(java.io.PrintWriter out) {
        }

        @Override
        public void setLoginTimeout(int seconds) {
        }

        @Override
        public int getLoginTimeout() {
            return 0;
        }

        @Override
        public java.util.logging.Logger getParentLogger() {
            return null;
        }

        @Override
        public <T> T unwrap(Class<T> iface) throws SQLException {
            throw new SQLException("Not supported");
        }

        @Override
        public boolean isWrapperFor(Class<?> iface) {
            return false;
        }
    }

    private void printRedError(String message) {
        String ANSI_RED = "\u001B[31m";
        String ANSI_RESET = "\u001B[0m";
        System.err.println(ANSI_RED + "================================" + ANSI_RESET);
        System.err.println(ANSI_RED + message + ANSI_RESET);
        System.err.println(ANSI_RED + "================================" + ANSI_RESET);
    }
}
