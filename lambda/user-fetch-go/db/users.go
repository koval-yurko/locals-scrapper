package db

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/pkg/errors"

	db "failwin/locals-scrapper/lambda/user-fetch-go/db/generated"
	"failwin/locals-scrapper/lambda/user-fetch-go/types"
	dbTypes "github.com/steebchen/prisma-client-go/runtime/types"
)

type UsersRepository struct {
	client *DBClient
}

func NewUsersRepository(client *DBClient) *UsersRepository {
	return &UsersRepository{
		client: client,
	}
}

func (repo *UsersRepository) Create(ctx context.Context, user types.User, photos []types.UserPhoto) (*db.UserModel, error) {
	attrs := []db.UserSetParam{
		db.User.LocalsID.Set(fmt.Sprintf("%s", user.Id)),
		db.User.FirstName.Set(user.FirstName),
		db.User.LastName.Set(user.LastName),
		db.User.Username.Set(user.Username),
		db.User.Age.Set(int(user.Age)),
		db.User.Gender.Set(user.Gender),
		db.User.Description.Set(user.Description),
		db.User.Occupation.Set(user.Occupation),
		db.User.Country.Set(user.Country),
		db.User.City.Set(user.City),
		db.User.ShareLink.Set(user.ShareLink),
		db.User.LinkedinLink.Set(user.LinkedinLink),
		db.User.InstagramUsername.Set(user.InstagraUsername),
		db.User.AvatarPicture.Set(user.AvatarPicture),
	}

	if user.Labels.Height > 0 {
		attrs = append(attrs, db.User.Height.Set(int(user.Labels.Height)))
	}

	jsonData, err := json.Marshal(photos) // Convert struct to JSON bytes
	if err != nil {
		return nil, errors.Wrap(err, "Error marshaling photos json")
	}

	attrs = append(attrs, db.User.Photos.Set(jsonData))

	userModel, err := repo.client.User.CreateOne(attrs...).Exec(ctx)
	if err != nil {
		_, isConstraintError := dbTypes.CheckUniqueConstraint[db.UserScalarFieldEnum](err)
		if isConstraintError {
			return nil, nil
		}
		return nil, errors.Wrap(err, "Error creating user")
	}

	return userModel, nil
}
