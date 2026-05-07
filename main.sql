CREATE TABLE login (
    user_id INT UNSIGNED AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_login PRIMARY KEY (user_id)
);

-- Patient profile table
CREATE TABLE patient (
    user_id INT UNSIGNED NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15) NOT NULL UNIQUE,
    dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_patient PRIMARY KEY (user_id),
    CONSTRAINT fk_patient_login
        FOREIGN KEY (user_id) REFERENCES login(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_patient_name CHECK (CHAR_LENGTH(TRIM(name)) >= 2),
    CONSTRAINT chk_patient_phone CHECK (CHAR_LENGTH(phone_no) BETWEEN 10 AND 15)
);

-- Example doctor table (optional, for later)
CREATE TABLE doctor (
    user_id INT UNSIGNED NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    phone_no VARCHAR(15) UNIQUE,
    CONSTRAINT pk_doctor PRIMARY KEY (user_id),
    CONSTRAINT fk_doctor_login
        FOREIGN KEY (user_id) REFERENCES login(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
insert into login(email,password,role) value ('admin@h.com','admin','admin');

DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS login;

select * from patient ;
select * from login ;
select * from doctor ;
select * from admin ;