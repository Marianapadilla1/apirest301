CREATE DATABASE IF NOT EXISTS db_tienda_mariana
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE db_tienda_mariana;

CREATE TABLE IF NOT EXISTS tb_productos (
  pk_clave_pro INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  fk_clave_cat INT DEFAULT NULL,
  PRIMARY KEY (pk_clave_pro)
) ENGINE=InnoDB
  AUTO_INCREMENT=13
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;