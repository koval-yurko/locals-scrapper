package types

type UserLabels struct {
	Height int32 `json:"height"`
}

type UserPhoto struct {
	Id     int32  `json:"id"`
	Image  string `json:"image"`
	IsMain bool   `json:"is_main"`
}

type User struct {
	Id               int32      `json:"id"`
	FirstName        string     `json:"first_name"`
	LastName         string     `json:"last_name"`
	Username         string     `json:"username"`
	AvatarPicture    string     `json:"avatar_picture"`
	Age              int32      `json:"age"`
	Gender           string     `json:"gender"`
	Occupation       string     `json:"occupation"`
	Country          string     `json:"country"`
	City             string     `json:"city"`
	Labels           UserLabels `json:"labels"`
	Description      string     `json:"description"`
	ShareLink        string     `json:"share_link"`
	LinkedinLink     string     `json:"linkedin_link"`
	InstagraUsername string     `json:"instagram_username"`
}
