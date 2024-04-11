CREATE TABLE `appointments`.`logtable_2` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(255) NOT NULL,
	`done` ENUM("True", "False") NOT NULL,
	`aTime` TIMESTAMP NOT NULL,	
	`apptid` INT ,
	`pxid` VARCHAR(255),
	`queuedate` DATETIME ,
	`hospitalname` VARCHAR(255) ,
	`city` VARCHAR(255) ,
	`regionname` VARCHAR(255) ,
	`type` ENUM("Consultation", "Inpatient") ,
	`status` ENUM("Complete", "Queued", "Serving", "Noshow", "Cancel", "Skip", "Admitted") ,
PRIMARY KEY (`id`));

CREATE TABLE `appointments`.`logtable_3` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(255) NOT NULL,
	`done` ENUM("True", "False") NOT NULL,
	`aTime` TIMESTAMP NOT NULL,	
	`apptid` INT,
	`pxid` VARCHAR(255) ,
	`queuedate` DATETIME ,
	`hospitalname` VARCHAR(255) ,
	`city` VARCHAR(255) ,
	`regionname` VARCHAR(255) ,
	`type` ENUM("Consultation", "Inpatient") ,
	`status` ENUM("Complete", "Queued", "Serving", "Noshow", "Cancel", "Skip", "Admitted") ,
PRIMARY KEY (`id`));

DELIMITER //
CREATE TRIGGER insert_appointments AFTER INSERT 
ON appointments FOR EACH ROW
BEGIN
	IF NEW.regionname LIKE '%(I)%'
	OR NEW.regionname LIKE '%(II)%'
	OR NEW.regionname LIKE '%(III)%'
	OR NEW.regionname LIKE '%(IV-A)%'
	OR NEW.regionname LIKE '%(IV-B)%'
	OR NEW.regionname LIKE '%(V)%'
	OR NEW.regionname LIKE '%(CAR)%'
	OR NEW.regionname LIKE '%(NCR)%' THEN
		INSERT INTO logtable_2 SET
		`action` = 'INSERT',
		done = 'False',
		aTime = NOW(),
		apptid = NEW.apptid,
        pxid = NEW.pxid,
		queuedate = NEW.queuedate,
		hospitalname = NEW.hospitalname,
		city = NEW.city,
		regionname = NEW.regionname,
        `type` = NEW.`type`,
        `status` = NEW.`status`;
	ELSE
		INSERT INTO logtable_3 SET
		`action` = 'INSERT',
		done = 'False',
		aTime = NOW(),
		apptid = NEW.apptid,
        pxid = NEW.pxid,
		queuedate = NEW.queuedate,
		hospitalname = NEW.hospitalname,
		city = NEW.city,
		regionname = NEW.regionname,
        `type` = NEW.`type`,
        `status` = NEW.`status`;
	END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER delete_appointments AFTER DELETE 
ON appointments FOR EACH ROW
BEGIN
	IF OLD.regionname LIKE '%(I)%'
	OR OLD.regionname LIKE '%(II)%'
	OR OLD.regionname LIKE '%(III)%'
	OR OLD.regionname LIKE '%(IV-A)%'
	OR OLD.regionname LIKE '%(IV-B)%'
	OR OLD.regionname LIKE '%(V)%'
	OR OLD.regionname LIKE '%(CAR)%'
	OR OLD.regionname LIKE '%(NCR)%' THEN
		INSERT INTO logtable_2 SET
		`action` = 'DELETE',
		done = 'False',
		aTime = NOW(),
		apptid = OLD.apptid,
        pxid = OLD.pxid,
		queuedate = OLD.queuedate,
		hospitalname = OLD.hospitalname,
		city = OLD.city,
		regionname = OLD.regionname,
        `type` = OLD.`type`,
        `status` = OLD.`status`;
	ELSE
		INSERT INTO logtable_3 SET
		`action` = 'DELETE',
		done = 'False',
		aTime = NOW(),
		apptid = OLD.apptid,
        pxid = OLD.pxid,
		queuedate = OLD.queuedate,
		hospitalname = OLD.hospitalname,
		city = OLD.city,
		regionname = OLD.regionname,
        `type` = OLD.`type`,
        `status` = OLD.`status`;
	END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_appointments AFTER UPDATE 
ON appointments FOR EACH ROW
BEGIN
	IF NEW.regionname LIKE '%(I)%'
	OR NEW.regionname LIKE '%(II)%'
	OR NEW.regionname LIKE '%(III)%'
	OR NEW.regionname LIKE '%(IV-A)%'
	OR NEW.regionname LIKE '%(IV-B)%'
	OR NEW.regionname LIKE '%(V)%'
	OR NEW.regionname LIKE '%(CAR)%'
	OR NEW.regionname LIKE '%(NCR)%' THEN
		INSERT INTO logtable_2 SET
		`action` = 'UPDATE',
		done = 'False',
		aTime = NOW(),
		apptid = NEW.apptid,
        pxid = NEW.pxid,
		queuedate = NEW.queuedate,
		hospitalname = NEW.hospitalname,
		city = NEW.city,
		regionname = NEW.regionname,
        `type` = NEW.`type`,
        `status` = NEW.`status`;
	ELSE
		INSERT INTO logtable_3 SET
		`action` = 'UPDATE',
		done = 'False',
		aTime = NOW(),
		apptid = NEW.apptid,
        pxid = NEW.pxid,
		queuedate = NEW.queuedate,
		hospitalname = NEW.hospitalname,
		city = NEW.city,
		regionname = NEW.regionname,
        `type` = NEW.`type`,
        `status` = NEW.`status`;
	END IF;
END//
DELIMITER ;
