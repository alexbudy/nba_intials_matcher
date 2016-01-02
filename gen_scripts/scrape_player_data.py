import urllib.request as ur
from string import ascii_lowercase
from bs4 import BeautifulSoup as BS
import sys
import json

'''
This script generates all player data into a javascript table
var allPlayers = []
				First, Last, Start, To, Pos, Ht, Birth, College, url
allPlayers[0] = ['Kobe', 'Bryant', 1997, 2016, 'G-F', '6-6', 212, 'August 23, 1978', None, 'b/bryanko01.html']
allPlayers[1] = ['LeBron', 'James', 2004, 2016, 'F-G', '6-8', 250, 'December 30, 1984', None, 'j/jamesle01.html']
'''

base_url = 'http://www.basketball-reference.com/players/' # append letter from 'a' to 'z'
			# 'First', 'Last', Start, To, 'Pos', 'Ht', Wt, 'Birthdate', College, 'url'
templateOrig = "[{0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}]," # <- this one is fastest

print("var start = new Date().getTime();")
print("var allPlayers = [")
playerIdx = 0
for c in ascii_lowercase:
	url = base_url + c
	with ur.urlopen(url) as url:
		s = url.read()

	soup = BS(s, "html.parser")

	try:

		for row in soup('table', {'id' : 'players'})[0].tbody('tr'):
			tds = row('td')
			fullname = json.dumps(tds[0].a.string).replace("\"", "").split()  # First Last
			
			firstname =  json.dumps(fullname[0])
			lastname = json.dumps(fullname[1])

			playerLink = json.dumps(tds[0].a['href'])
			yrFrom = tds[1].string 
			yrTo = tds[2].string
			pos = tds[3].string
			ht = tds[4].string
			wt = tds[5].string
			birthdate = tds[6].string
			college = tds[7].string

			if (yrFrom == None):
				yrFrom = 'null'
			if (yrTo == None):
				yrTo = 'null'
			if (pos == None):
				pos = 'null'
			else:
				pos = json.dumps(pos)
			if (ht == None):
				ht = 'null'
			else:
				ht = json.dumps(ht)
			if (wt == None):
				wt = 'null'
			if (college == None):
				college = 'null' # for JS purposes
			else:
				college = json.dumps(college)

			if (birthdate == None): #assume if birthdate not listed then player is not well known
				continue
			else:
				birthdate = json.dumps(birthdate)

			# 'First', 'Last', Start, To, 'Pos', 'Ht', Wt, 'Birthdate', College, 'url'
			#template = "allPlayers[{0}]= [   {1}, {2}, {3}, {4}, '{5}', '{6}', {7}, '{8}', {9}, '{10}']"
			#templatePush = "allPlayers.push([{0}, {1}, {2}, {3}, '{4}', '{5}', {6}, '{7}', {8}, '{9}'])"

			# experiment with push() vs index - time & see difference

			#print(template.format(playerIdx, firstname, lastname, yrFrom, yrTo, pos, ht, wt, birthdate, college, playerLink))
			#print(templatePush.format(firstname, lastname, yrFrom, yrTo, pos, ht, wt, birthdate, college, playerLink))
			print(templateOrig.format(firstname, lastname, yrFrom, yrTo, pos, ht, wt, birthdate, college, playerLink))

			playerIdx += 1
			#if (playerIdx >= 2000):
			#sys.exit(0)
	except IndexError:
		continue

print("]")
print("var end = new Date().getTime();")
print("var time = end - start;")
print("alert('Execution time: ' + time);")
