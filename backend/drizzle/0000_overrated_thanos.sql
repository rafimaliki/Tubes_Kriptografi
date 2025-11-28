CREATE TABLE IF NOT EXISTS "app_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"public_key" varchar(64) NOT NULL,
	CONSTRAINT "app_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"from_user_id" serial NOT NULL,
	"to_user_id" serial NOT NULL,
	"message" varchar(1024) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_room" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user1_id" serial NOT NULL,
	"user2_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nonce_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"nonce" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat" ADD CONSTRAINT "chat_room_id_chat_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "chat_room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
