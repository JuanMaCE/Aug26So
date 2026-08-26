CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(150) NOT NULL,
	`name` varchar(100) NOT NULL,
	`secondName` varchar(100) NOT NULL,
	`Age` int NOT NULL,
	`password` varchar(250) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
