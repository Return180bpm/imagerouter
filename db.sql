DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image TEXT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      location VARCHAR(255)
      );

DROP TABLE IF EXISTS places CASCADE;
CREATE TABLE places(
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    lat NUMERIC(14, 11) NOT NULL,
    lng NUMERIC(14, 11) NOT NULL,
    tags TEXT [],
    is_natural BOOLEAN NOT NULL,
    radius FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS routes CASCADE;
CREATE TABLE routes(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    places TEXT [] NOT NULL,
    duration INT NOT NULL,
    distance FLOAT NOT NULL,
    thumbnail TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS images CASCADE;
CREATE TABLE images(
    image TEXT NOT NULL UNIQUE,
    title TEXT,
    lat NUMERIC(14, 11) NOT NULL,
    lng NUMERIC(14, 11) NOT NULL,
    place_id VARCHAR(255) NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(image, place_id)
);

DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews(
    id SERIAL PRIMARY KEY,
    place_id VARCHAR(255) REFERENCES places(id) ON DELETE CASCADE,
    route_id INT REFERENCES routes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_not_null CHECK (num_nonnulls(place_id, route_id) = 1)
);

DROP TABLE IF EXISTS reset_codes CASCADE;
CREATE TABLE reset_codes(
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);