package session

import (
	"github.com/pritunl/pritunl-zero/agent"
	"github.com/pritunl/pritunl-zero/database"
	"github.com/pritunl/pritunl-zero/settings"
	"github.com/pritunl/pritunl-zero/utils"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"net/http"
	"time"
)

func Get(db *database.Database, sessId string) (
	sess *Session, err error) {

	coll := db.Sessions()
	sess = &Session{}

	err = coll.FindOneId(sessId, sess)
	if err != nil {
		return
	}

	return
}

func GetUpdate(db *database.Database, sessId string) (
	sess *Session, err error) {

	query := bson.M{
		"_id": sessId,
	}

	if settings.Auth.Expire != 0 {
		expire := time.Now().Add(-time.Duration(
			settings.Auth.Expire) * time.Hour)
		query["last_active"] = &bson.M{
			"$gte": expire,
		}
	}

	if settings.Auth.MaxDuration != 0 {
		expire := time.Now().Add(-time.Duration(
			settings.Auth.MaxDuration) * time.Hour)
		query["timestamp"] = &bson.M{
			"$gte": expire,
		}
	}

	coll := db.Sessions()
	sess = &Session{}
	timestamp := time.Now()

	change := mgo.Change{
		Update: &bson.M{
			"$set": &bson.M{
				"last_active": timestamp,
			},
		},
	}

	_, err = coll.Find(query).Apply(change, sess)
	if err != nil {
		err = database.ParseError(err)
		return
	}

	sess.LastActive = timestamp

	return
}

func GetAll(db *database.Database, userId bson.ObjectId) (
	sessions []*Session, err error) {

	coll := db.Sessions()
	sessions = []*Session{}

	cursor := coll.Find(bson.M{
		"user_id": userId,
	}).Iter()

	sess := &Session{}
	for cursor.Next(sess) {
		sessions = append(sessions, sess)
		sess = &Session{}
	}

	err = cursor.Close()
	if err != nil {
		err = database.ParseError(err)
		return
	}

	return
}

func New(db *database.Database, r *http.Request, userId bson.ObjectId) (
	sess *Session, err error) {

	id, err := utils.RandStr(32)
	if err != nil {
		return
	}

	agnt, err := agent.Parse(db, r)
	if err != nil {
		return
	}

	coll := db.Sessions()
	sess = &Session{
		Id:         id,
		UserId:     userId,
		Timestamp:  time.Now(),
		LastActive: time.Now(),
		Agent:      agnt,
	}

	err = coll.Insert(sess)
	if err != nil {
		err = database.ParseError(err)
		return
	}

	return
}

func Remove(db *database.Database, id string) (err error) {
	coll := db.Sessions()

	err = coll.RemoveId(id)
	if err != nil {
		err = database.ParseError(err)

		switch err.(type) {
		case *database.NotFoundError:
			err = nil
		default:
			return
		}
	}

	return
}
