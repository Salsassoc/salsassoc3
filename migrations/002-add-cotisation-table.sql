CREATE TABLE IF NOT EXISTS cotisation (
   id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
   label VARCHAR(50) NOT NULL,
   amount FLOAT NOT NULL,
   start_date DATE NOT NULL,
   end_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS cotisation_member (
   person_id INTEGER NOT NULL,
   cotisation_id INTEGER NOT NULL,
   date DATE NOT NULL,
   amount FLOAT NOT NULL,
   payment_method INTEGER NULL
);
