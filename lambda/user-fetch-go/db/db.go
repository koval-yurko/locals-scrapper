package db

import (
	db "failwin/locals-scrapper/lambda/user-fetch-go/db/generated"
	"github.com/pkg/errors"
	"log"
)

type DBClient = db.PrismaClient

type UserSetParam = db.UserSetParam

func GetClient() (*DBClient, error) {
	client := db.NewClient()

	err := client.Connect()
	if err != nil {
		log.Printf("Error connecting to Prisma: %v", err)
		return nil, errors.Wrap(err, "Failed to connect DB")
	}

	return client, nil
}
