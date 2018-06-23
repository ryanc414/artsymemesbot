#!/usr/bin/env python3
"""Bot backend to find the freshest memes from the Louvre."""
import tweepy
import random
import os
import sys

try:
    CONSUMER_KEY = os.environ['TWTR_CONSUMER_KEY']
    CONSUMER_SECRET = os.environ['TWTR_CONSUMER_SECRET']
    ACCESS_TOKEN = os.environ['TWTR_ACCESS_TOKEN']
    ACCESS_TOKEN_SECRET = os.environ['TWTR_ACCESS_TOKEN_SECRET']
except KeyError:
    print('Error, you must set each of TWTR_CONSUMER_KEY,\n'
          'TWTR_CONSUMER_SECRET, TWTR_ACCESS_TOKEN and\n'
          'TWTR_ACCESS_TOKEN_SECRET envronment variables.')
    sys.exit(1)

USERNAMES = ('ClassicArtMeme', 'classicartmemes')


def get_image_urls(username):
    """Call into the twitter API to retrieve the URLs of some dank memes."""
    auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

    api = tweepy.API(auth)

    public_tweets = api.user_timeline(username)

    image_urls = []
    for tweet in public_tweets:
        try:
            image_url = tweet._json["entities"]["media"][0]["media_url"]
            image_urls.append(image_url)
        except KeyError:
            pass
        except IndexError:
            pass

    return image_urls


def get_random_image():
    """Retrieve a URL of a single top quality meme."""
    meme_source = random.choice(USERNAMES)
    dank_memes = get_image_urls(meme_source)
    return random.choice(dank_memes)


if __name__ == '__main__':
    print(get_random_image())
    sys.exit(0)

