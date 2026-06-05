-- =========================================================
-- RAG Web Chat - MySQL DDL (UUID CHAR(36) version)
-- =========================================================

-- Opsional: pakai DB khusus
-- CREATE DATABASE IF NOT EXISTS rag_web_chat
--   CHARACTER SET utf8mb4
--   COLLATE utf8mb4_0900_ai_ci;
-- USE rag_web_chat;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1) users
-- ----------------------------
CREATE TABLE IF NOT EXISTS users (
  id              CHAR(36)        NOT NULL, -- UUID string
  email           VARCHAR(191)    NOT NULL,
  username        VARCHAR(50)     NULL,
  password_hash   VARCHAR(255)    NOT NULL,
  display_name    VARCHAR(100)    NOT NULL,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB;

-- ----------------------------
-- 2) endpoint_modes (master)
-- ----------------------------
CREATE TABLE IF NOT EXISTS endpoint_modes (
  id              TINYINT UNSIGNED NOT NULL,
  code            VARCHAR(20)      NOT NULL,   -- rag | oltp | dwh
  name            VARCHAR(100)     NOT NULL,
  description     VARCHAR(255)     NULL,
  is_active       TINYINT(1)       NOT NULL DEFAULT 1,

  PRIMARY KEY (id),
  UNIQUE KEY uq_endpoint_modes_code (code)
) ENGINE=InnoDB;

-- Seed mode endpoint
INSERT INTO endpoint_modes (id, code, name, description, is_active)
VALUES
  (1, 'rag',  'RAG Database',            'Tanya jawab berbasis retrieval context', 1),
  (2, 'oltp', 'SQL Normalisasi (OLTP)',  'Query berbasis schema relasional normalisasi', 1),
  (3, 'dwh',  'SQL Denormalisasi (DWH)', 'Query untuk data warehouse denormalisasi', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  is_active = VALUES(is_active);

-- ----------------------------
-- 3) chat_sessions
-- ----------------------------
CREATE TABLE IF NOT EXISTS chat_sessions (
  id               CHAR(36)         NOT NULL, -- UUID string
  user_id          CHAR(36)         NOT NULL,
  title            VARCHAR(150)     NOT NULL,
  started_mode_id  TINYINT UNSIGNED NULL,
  status           ENUM('active','archived','deleted') NOT NULL DEFAULT 'active',
  created_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_chat_sessions_user_updated (user_id, updated_at),
  KEY idx_chat_sessions_status_updated (status, updated_at),
  KEY idx_chat_sessions_started_mode (started_mode_id),

  CONSTRAINT fk_chat_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_chat_sessions_started_mode
    FOREIGN KEY (started_mode_id) REFERENCES endpoint_modes(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------
-- 4) chat_messages
-- ----------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  session_id        CHAR(36)         NOT NULL,
  sender            ENUM('user','assistant','system') NOT NULL,
  content           LONGTEXT         NOT NULL,
  endpoint_mode_id  TINYINT UNSIGNED NULL,
  source            ENUM('node-red','mock','manual') NULL,
  sequence_no       INT UNSIGNED     NOT NULL,
  created_at        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_chat_messages_session_seq (session_id, sequence_no),
  KEY idx_chat_messages_session_created (session_id, created_at),
  KEY idx_chat_messages_mode (endpoint_mode_id),

  CONSTRAINT fk_chat_messages_session
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_chat_messages_mode
    FOREIGN KEY (endpoint_mode_id) REFERENCES endpoint_modes(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------
-- 5) message_metrics (1:1 dengan message)
-- ----------------------------
CREATE TABLE IF NOT EXISTS message_metrics (
  message_id        BIGINT UNSIGNED  NOT NULL,
  latency_ms        INT UNSIGNED     NULL,
  token_in          INT UNSIGNED     NULL,
  token_out         INT UNSIGNED     NULL,
  cost_usd          DECIMAL(12,6)    NULL,
  cost_idr          DECIMAL(14,4)    NULL,
  raw_metrics_json  JSON             NULL,
  created_at        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (message_id),

  CONSTRAINT fk_message_metrics_message
    FOREIGN KEY (message_id) REFERENCES chat_messages(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- 6) refresh_tokens (opsional auth)
-- ----------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          CHAR(36)        NOT NULL,
  token_hash       CHAR(64)        NOT NULL,
  expires_at       DATETIME        NOT NULL,
  revoked_at       DATETIME        NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_user (user_id),
  KEY idx_refresh_tokens_exp (expires_at),

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;