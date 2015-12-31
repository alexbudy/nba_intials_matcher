import urllib.request as ur
from string import ascii_lowercase
from bs4 import BeautifulSoup as BS

base_url = 'http://www.basketball-reference.com/players/' # append letter from 'a' to 'z'

data = ''
for c in ascii_lowercase:
	if c == 'c':
		url = base_url + c
		with ur.urlopen(url) as url:
			s = url.read()

		soup = BS(s, "html.parser")

		for row in soup('table', {'id' : 'players'})[0].tbody('tr'):
			tds = row('td')
			print(tds[0].string)