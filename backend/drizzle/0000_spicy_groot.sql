CREATE TABLE IF NOT EXISTS "user" (
	"id" integer PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"password" varchar(64) NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
