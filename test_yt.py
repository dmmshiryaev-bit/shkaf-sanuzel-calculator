from pytubefix import YouTube

url = "https://www.youtube.com/watch?v=ff3RKieIcF4"
yt = YouTube(url)
print("Title:", yt.title)
print("Captions:", list(yt.captions.keys()))
