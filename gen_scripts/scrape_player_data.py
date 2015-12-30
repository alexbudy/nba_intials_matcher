import urllib.request
from string import ascii_lowercase

base_url = 'http://www.databasebasketball.com/players/playerlist.htm?lt=' # append letter from 'a' to 'z'

data = ''
for c in ascii_lowercase:
	if c == 'z':
		url = base_url + c
		page = urllib.request.urlopen(url)
		data=page.read()
		lines = data.splitlines()
		for line in lines:
			print(line)
