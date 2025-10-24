package locals

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/pkg/errors"

	"failwin/locals-scrapper/lambda/user-fetch-go/types"
)

const baseUrl = "https://api.locals.org"

type LocalsAPI struct{}

func NewLocalsAPI() *LocalsAPI {
	return &LocalsAPI{}
}

type RequestOptions struct {
	method string
	body   io.Reader
}

func (api *LocalsAPI) GetUser(id string) (*types.User, error) {
	url := fmt.Sprintf("/v1/users/%s/", id)
	resp, err := api.executeRequest(url, RequestOptions{
		method: "GET",
	})
	if err != nil {
		return nil, errors.Wrap(err, "Failed execute GetUser request")
	}

	var user types.User
	err = json.Unmarshal(resp, &user)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to Unmarshal GetUser response")
	}

	return &user, nil
}

func (api *LocalsAPI) GetUserPhotos(id string) (*[]types.UserPhoto, error) {
	url := fmt.Sprintf("/v1/users/%s/photos", id)
	resp, err := api.executeRequest(url, RequestOptions{
		method: "GET",
	})
	if err != nil {
		return nil, errors.Wrap(err, "Failed execute GetUserPhotos request")
	}

	var photos []types.UserPhoto
	err = json.Unmarshal(resp, &photos)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to Unmarshal GetUserPhotos response")
	}

	return &photos, nil
}

func (*LocalsAPI) executeRequest(url string, options RequestOptions) ([]byte, error) {
	finalUrl := baseUrl + url
	req, err := http.NewRequest(options.method, finalUrl, options.body)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to execute request")
	}
    const accessToken = os.Getenv("LOCALS_ACCESS_TOKEN")
	req.Header.Add("Authorization", fmt.Sprintf("Token %s", accessToken))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "Failed execute request")
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.Printf("Failed to close request body")
		}
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to read response body")
	}

	return body, nil
}
