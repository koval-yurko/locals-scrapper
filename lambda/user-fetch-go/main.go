package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"sync"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/joho/godotenv"

	"failwin/locals-scrapper/lambda/user-fetch-go/db"
	"failwin/locals-scrapper/lambda/user-fetch-go/locals"
	"failwin/locals-scrapper/lambda/user-fetch-go/types"
)

func fetchUser(userID string) error {
	ctx := context.Background()

	api := locals.NewLocalsAPI()

	var wg sync.WaitGroup
	var user *types.User
	var photos *[]types.UserPhoto
	var userErr, photosErr error

	wg.Add(2)

	go func() {
		defer wg.Done()
		user, userErr = api.GetUser(userID)
	}()

	go func() {
		defer wg.Done()
		photos, photosErr = api.GetUserPhotos(userID)
	}()

	wg.Wait()

	if userErr != nil {
		log.Printf("Failed to get user: %v", userErr)
		return userErr
	}
	if photosErr != nil {
		log.Printf("Failed to get user photos: %v", photosErr)
		return photosErr
	}

	client, err := db.GetClient()
	if err != nil {
		log.Printf("Failed connect DB: %v", err)
		return err
	}
	userRepository := db.NewUsersRepository(client)

	model, err := userRepository.Create(ctx, *user, *photos)
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		return err
	}

	if model == nil {
		log.Printf("User %s is already exists", userID)
	} else {
		log.Printf("User %s is created succesfyly, db: %v", userID, model.ID)
		log.Println(model.ID)
	}

	return nil
}

type SQSMessageBody struct {
	UserId string `json:"userId"`
}

func handler(_ context.Context, request events.SQSEvent) (events.SQSEventResponse, error) {
	batchItemFailures := []events.SQSBatchItemFailure{}

	var path = os.Getenv("PATH")
	log.Printf("PATH: %v", path)

	var cwd, _ = os.Getwd()
	log.Printf("cwd: %v", cwd)

	for _, record := range request.Records {
		messageBody := SQSMessageBody{}
		json.Unmarshal([]byte(record.Body), &messageBody)

		log.Printf("request: %v", request)
		log.Printf("record: %v", record)
		log.Printf("record.MessageId: %v", record.MessageId)
		log.Printf("messageBody.UserId: %v", messageBody.UserId)

		err := fetchUser(messageBody.UserId)

		log.Printf("err: %v", err)

		if err != nil {
			batchItemFailures = append(batchItemFailures, events.SQSBatchItemFailure{
				ItemIdentifier: record.MessageId,
			})
		}
	}

	log.Printf("batchItemFailures: %v", batchItemFailures)

	return events.SQSEventResponse{
		BatchItemFailures: batchItemFailures,
	}, nil
}

func main() {
	lambda.Start(handler)
}

func mainLocal() {

	/*
		request := events.SQSEvent{
			Records: make([]events.SQSMessage, 0),
		}
	*/
	userID := "103526"

	err := godotenv.Load()
	if err != nil {
		log.Fatalf("failed to load envs: %v", err)
	}

	fetchUser(userID)
}
