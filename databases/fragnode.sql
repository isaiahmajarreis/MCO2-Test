CREATE TABLE `appointments`.`log_table` (
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
CREATE TRIGGER insert_appointment AFTER INSERT 
ON appointments FOR EACH ROW
BEGIN
	INSERT INTO log_table SET
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
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER delete_appointment AFTER DELETE 
ON appointments FOR EACH ROW
BEGIN
	INSERT INTO log_table SET
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
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_appointment AFTER UPDATE 
ON appointments FOR EACH ROW
BEGIN
	INSERT INTO log_table SET
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
END//
DELIMITER ;
