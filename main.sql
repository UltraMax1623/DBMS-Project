CREATE TABLE login (
    user_id INT UNSIGNED AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active ENUM('active','deactive') NOT NULL default 'active',

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
	dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,

    CONSTRAINT pk_doctor PRIMARY KEY (user_id),
    CONSTRAINT fk_doctor_login
        FOREIGN KEY (user_id) REFERENCES login(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

insert into login(email,password,role) value ('admin@h.com','admin','admin');

CREATE TABLE appointment (
    appointment_id INT UNSIGNED AUTO_INCREMENT,
    doctor_id INT UNSIGNED NOT NULL,
    patient_id INT UNSIGNED NOT NULL,

    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    reason VARCHAR(255) NOT NULL,

    request ENUM('pending', 'confirmed','declined','completed') NOT NULL DEFAULT 'pending',

    CONSTRAINT pk_appointment PRIMARY KEY (appointment_id),

    CONSTRAINT fk_doctor_appointment
        FOREIGN KEY (doctor_id) REFERENCES doctor(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_patient_appointment
        FOREIGN KEY (patient_id) REFERENCES patient(user_id)
        ON DELETE RESTRICT
);

CREATE TABLE appointment_messages (
    message_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    appointment_id INT UNSIGNED NOT NULL,
    sender_user_id INT UNSIGNED NOT NULL,
    sender_role ENUM('patient', 'doctor') NOT NULL,
    message_text TEXT NOT NULL,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,

    PRIMARY KEY (message_id),

    CONSTRAINT fk_appointment_messages_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointment(appointment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_appointment_messages_user
        FOREIGN KEY (sender_user_id)
        REFERENCES login(user_id)  -- or your actual users table
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_appointment_messages_lookup (appointment_id, sent_at),
    INDEX idx_appointment_messages_sender (sender_user_id)
);

DROP TABLE IF EXISTS appointment;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS login;
DROP TABLE IF EXISTS appointment_messages;

select * from patient ;
select * from login ;
select * from doctor ;
select * from appointment;
select * from appointment_messages;

-- To create admin and grant privileges user
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'rvupnm';
GRANT ALL PRIVILEGES ON project.* TO 'admin'@'localhost';

-- 1) signup patient
START TRANSACTION;

INSERT INTO login (email, password, role)
VALUES ('patient1@example.com', 'your_password_here', 'patient');

SET @new_user_id = LAST_INSERT_ID();

INSERT INTO patient (user_id, name, phone_no, dob, gender)
VALUES (@new_user_id, 'Pavan', '9876543210', '2004-01-15', 'Male');

COMMIT;

-- 2) signup doctor
START TRANSACTION;

INSERT INTO login (email, password, role)
VALUES ('doctor1@example.com', 'your_password_here', 'doctor');

SET @new_user_id = LAST_INSERT_ID();

INSERT INTO doctor (user_id, name, specialization, phone_no, dob, gender)
VALUES (@new_user_id, 'Dr Pavan', 'Cardiology', '9876543210', '2000-01-15', 'Male');

COMMIT;

-- 3) doctor list
SELECT 
    d.user_id,
    d.name,
    l.email,
    d.specialization,
    d.phone_no,
    d.dob,
    d.gender
FROM doctor d
JOIN login l ON d.user_id = l.user_id
WHERE l.role = 'doctor'
  AND l.is_active = 'active'
ORDER BY d.user_id ASC;

-- 4) patient list
SELECT 
    p.user_id,
    p.name,
    l.email,
    p.phone_no,
    p.dob,
    p.gender
FROM patient p
JOIN login l ON p.user_id = l.user_id
WHERE l.role = 'patient'
ORDER BY p.user_id ASC;

-- 5) appointment list (doctor)
SELECT
    a.appointment_id,
    p.name AS patient_name,
    d.name AS doctor_name,
    d.specialization,
    a.appointment_date,
    a.appointment_time,
    a.reason,
    a.request AS request_status
FROM appointment a
JOIN patient p ON a.patient_id = p.user_id
JOIN doctor d ON a.doctor_id = d.user_id
WHERE a.doctor_id = ?
  AND a.request IN ('confirmed', 'completed')
ORDER BY a.appointment_date DESC, a.appointment_time DESC;

-- 6) appointment list (patient)
SELECT 
    a.appointment_id,
    p.name AS patient_name,
    d.name AS doctor_name,
    d.specialization,
    a.appointment_date,
    a.appointment_time,
    a.reason,
    a.request AS request_status
FROM
    appointment a
        JOIN
    patient p ON a.patient_id = p.user_id
        JOIN
    doctor d ON a.doctor_id = d.user_id
WHERE
    a.patient_id = 1
ORDER BY a.appointment_date DESC , a.appointment_time DESC;

-- 7) user profile (doctor)
SELECT d.name,
l.email,
d.phone_no,
d.dob,
d.gender,
d.specialization
FROM doctor d
JOIN login l ON d.user_id = l.user_id
WHERE d.user_id = ?;
				
	-- user profile (doctor)
SELECT p.name,
l.email,
p.phone_no,
p.dob,
p.gender
FROM patient p
JOIN login l ON p.user_id = l.user_id
WHERE p.user_id = ?;

-- 8) messages
-- 1. Check appointment exists
SELECT appointment_id, doctor_id, patient_id
FROM appointment
WHERE appointment_id = ?;

	-- 2. Fetch messages only if authorized
SELECT
    m.message_id,
    m.appointment_id,
    m.sender_user_id,
    m.sender_role,
    m.message_text,
    m.sent_at,
    CASE
        WHEN m.sender_role = 'doctor' THEN d.name
        WHEN m.sender_role = 'patient' THEN p.name
        ELSE 'Unknown'
    END AS sender_display_name
FROM appointment_messages m
JOIN appointment a ON a.appointment_id = m.appointment_id
LEFT JOIN doctor d ON d.user_id = a.doctor_id
LEFT JOIN patient p ON p.user_id = a.patient_id
WHERE m.appointment_id = ?
  AND m.is_deleted = 0
  AND (
        (? = 'doctor' AND ? = a.doctor_id)
        OR
        (? = 'patient' AND ? = a.patient_id)
      )
ORDER BY m.sent_at ASC, m.message_id ASC;

-- 9) request appointment
INSERT INTO appointment
    (patient_id, doctor_id, appointment_date, appointment_time, reason, request)
VALUES
    (?, ?, ?, ?, ?, ?); -- Values (patient_id , doctor_id ,date , category , textInput ,'pending')
    
-- 10 ) updating appoitnment status
UPDATE appointment
             SET request = ?
             WHERE appointment_id = ?; -- values (status, appointment_id)

-- 11) doctor update appoinement status

UPDATE appointment
             SET request = ?
             WHERE appointment_id = ?; -- values (status, appointment_id)
             
-- 12) delete account
	-- PATIENT FLOW

SELECT user_id, email, password, role, is_active
FROM login
WHERE user_id = ? AND role = 'patient';
	-- Values (id)

UPDATE login
SET is_active = 'deactive'
WHERE user_id = ?;
	-- Values (id)
    
	-- ADMIN FLOW

SELECT user_id, email, password, role, is_active
FROM login
WHERE user_id = ? AND role = 'admin';
	-- Values (id)

SELECT user_id, email, role, is_active
FROM login
WHERE email = ?;
	-- Values (targetEmail)

UPDATE login
SET is_active = 'deactive'
WHERE user_id = ?;
	-- Values (targetUser.user_id)
    
-- 13) send messages

SELECT appointment_id, doctor_id, patient_id
FROM appointment
WHERE appointment_id = ?;
-- Values (appointment_id)

INSERT INTO appointment_messages
    (appointment_id, sender_user_id, sender_role, message_text)
VALUES
    (?, ?, ?, ?);
-- Values (appointment_id, sessionUserId, sessionRole, message_text.trim())

-- 14) deletechat

SELECT appointment_id, doctor_id, patient_id
FROM appointment
WHERE appointment_id = ?;
-- Values (appointment_id)

DELETE FROM appointment_messages
WHERE appointment_id = ?;
-- Values (appointment_id)

